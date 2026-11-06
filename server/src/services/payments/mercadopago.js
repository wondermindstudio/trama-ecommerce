import crypto from 'node:crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { env } from '../../config/env.js';

/**
 * Mercado Pago Checkout Pro. Los datos de tarjeta se ingresan en Mercado Pago,
 * nunca pasan por nuestro servidor (no hace falta certificación PCI).
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro
 */
const client = env.MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN })
  : null;

const STATUS_MAP = {
  approved: 'approved',
  authorized: 'approved',
  rejected: 'rejected',
  cancelled: 'rejected',
  refunded: 'refunded',
  charged_back: 'refunded',
};

// Restringe los medios que muestra Mercado Pago según lo elegido en nuestro checkout.
function paymentMethodsFor(method, installments) {
  const exclude = {
    credit_card: ['debit_card', 'ticket', 'bank_transfer', 'atm'],
    debit_card: ['credit_card', 'ticket', 'bank_transfer', 'atm'],
    cash: ['credit_card', 'debit_card', 'bank_transfer'],
    transfer: ['credit_card', 'debit_card', 'ticket', 'atm'],
  }[method];
  return {
    excluded_payment_types: (exclude ?? []).map((id) => ({ id })),
    installments: method === 'credit_card' ? installments : 1,
    default_installments: method === 'credit_card' ? installments : 1,
  };
}

export const mercadoPagoProvider = {
  name: 'mercadopago',

  async createCheckout(order) {
    // Se envía el total ya calculado como un único ítem: así descuentos, envío y
    // recargo por cuotas coinciden exactamente con lo que vio el cliente.
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: order.number,
            title: `Pedido ${order.number} · Trama`,
            quantity: 1,
            unit_price: order.pricing.total,
            currency_id: 'ARS',
          },
        ],
        external_reference: order.id,
        payment_methods: paymentMethodsFor(order.payment.method, order.pricing.financing.count),
        back_urls: {
          success: `${env.CLIENT_URL}/pedido/${order.id}`,
          pending: `${env.CLIENT_URL}/pedido/${order.id}`,
          failure: `${env.CLIENT_URL}/pedido/${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${env.API_URL}/api/payments/webhook/mercadopago`,
      },
    });
    return { status: 'pending', providerId: preference.id, checkoutUrl: preference.init_point };
  },

  async getPaymentStatus(paymentId) {
    const payment = await new Payment(client).get({ id: paymentId });
    return {
      orderId: payment.external_reference,
      status: STATUS_MAP[payment.status] ?? 'pending',
      providerId: String(payment.id),
    };
  },

  /**
   * Valida la firma x-signature del webhook (si configuraste MP_WEBHOOK_SECRET).
   * Plantilla firmada: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
   */
  verifyWebhook(req) {
    if (!env.MP_WEBHOOK_SECRET) return true;
    const signature = req.get('x-signature') ?? '';
    const requestId = req.get('x-request-id') ?? '';
    const parts = Object.fromEntries(
      signature.split(',').map((p) => p.trim().split('=').map((s) => s.trim())),
    );
    const dataId = String(req.query['data.id'] ?? req.body?.data?.id ?? '').toLowerCase();
    const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
    const expected = crypto
      .createHmac('sha256', env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');
    const received = parts.v1 ?? '';
    return (
      received.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    );
  },
};
