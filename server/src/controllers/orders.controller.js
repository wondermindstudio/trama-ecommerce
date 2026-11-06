import crypto from 'node:crypto';
import { z } from 'zod';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { buildQuote, cartInputSchema } from '../services/cart.service.js';
import { paymentProvider } from '../services/payments/index.js';
import { addressSchema } from './auth.controller.js';

export const createOrderSchema = cartInputSchema.extend({
  paymentMethod: cartInputSchema.shape.paymentMethod.unwrap(),
  cardBrand: z.string().max(30).optional(),
  shippingAddress: addressSchema.extend({ name: z.string().trim().min(2, 'Ingresá quién recibe.') }),
});

export const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(200).optional(),
});

function orderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `TRM-${date}-${crypto.randomInt(1000, 9999)}`;
}

// Descuenta stock de forma atómica; si algún producto no alcanza, devuelve lo descontado.
async function reserveStock(lines) {
  const reserved = [];
  for (const { product, qty } of lines) {
    const result = await Product.updateOne(
      { _id: product._id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
    );
    if (result.modifiedCount === 0) {
      await releaseStock(reserved);
      throw AppError.conflict(`${product.name} se quedó sin stock suficiente. Actualizá tu carrito.`);
    }
    reserved.push({ product, qty });
  }
}

async function releaseStock(lines) {
  await Promise.all(
    lines.map(({ product, qty }) => Product.updateOne({ _id: product._id }, { $inc: { stock: qty } })),
  );
}

export async function create(req, res) {
  const { shippingAddress, cardBrand, ...cart } = req.body;
  const { quote, lines } = await buildQuote(cart);

  if (lines.length === 0) throw AppError.badRequest('Tu carrito está vacío.');
  if (quote.warnings.length > 0) {
    throw AppError.conflict('Algunos productos cambiaron de stock. Revisá tu carrito.', quote.warnings);
  }
  if (cart.couponCode && quote.couponError) throw AppError.badRequest(quote.couponError);

  await reserveStock(lines);

  const order = new Order({
    number: orderNumber(),
    user: req.user._id,
    items: lines.map(({ product, qty, options }) => ({
      product: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty,
      options,
      lineTotal: product.price * qty,
    })),
    pricing: {
      subtotal: quote.subtotal,
      discounts: quote.discounts,
      discountTotal: quote.discountTotal,
      shipping: quote.shipping,
      paymentDiscount: quote.paymentDiscount ?? undefined,
      financing: quote.financing,
      total: quote.total,
    },
    shippingAddress,
    payment: { method: cart.paymentMethod, cardBrand, provider: paymentProvider.name },
    timeline: [{ status: 'pending_payment', note: 'Pedido creado' }],
  });

  try {
    const checkout = await paymentProvider.createCheckout(order);
    order.payment.providerId = checkout.providerId;
    order.payment.checkoutUrl = checkout.checkoutUrl;
    order.payment.instructions = checkout.instructions;
    order.payment.status = checkout.status;
    if (checkout.status === 'approved') order.setStatus('paid', 'Pago aprobado');
    await order.save();
  } catch (err) {
    await releaseStock(lines);
    throw err;
  }

  res.status(201).json(order);
}

export async function mine(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(orders);
}

export async function getOne(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw AppError.notFound('No encontramos ese pedido.');
  const isOwner = order.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw AppError.notFound('No encontramos ese pedido.');
  res.json(order);
}

export async function listAll(req, res) {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('user', 'name email');
  res.json(orders);
}

export async function updateStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw AppError.notFound();
  if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
    await releaseStock(order.items.map((i) => ({ product: { _id: i.product }, qty: i.qty })));
  }
  order.setStatus(req.body.status, req.body.note);
  await order.save();
  res.json(order);
}
