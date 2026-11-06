import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Promotion } from '../models/Promotion.js';
import { calculateQuote, PAYMENT_METHODS } from './pricing.js';
import { storeSettings } from '../config/store.js';

export const cartInputSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().min(1).max(20),
        options: z.record(z.string()).default({}),
      }),
    )
    .max(50),
  couponCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(Object.keys(PAYMENT_METHODS)).optional(),
  installments: z.number().int().min(1).max(24).default(1),
});

/**
 * Arma la cotización con precios y stock reales de la base de datos.
 * Nunca confía en precios enviados por el cliente.
 */
export async function buildQuote({ items, couponCode, paymentMethod, installments }) {
  const slugs = [...new Set(items.map((i) => i.slug))];
  const [products, promotions] = await Promise.all([
    Product.find({ slug: { $in: slugs }, active: true }),
    Promotion.find({ active: true }).lean(),
  ]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const warnings = [];
  const lines = [];
  for (const item of items) {
    const product = bySlug.get(item.slug);
    if (!product) {
      warnings.push({ slug: item.slug, message: 'Este producto ya no está disponible.' });
      continue;
    }
    let qty = item.qty;
    if (product.stock < qty) {
      qty = product.stock;
      warnings.push({
        slug: item.slug,
        message:
          product.stock === 0
            ? `${product.name} se quedó sin stock.`
            : `Solo quedan ${product.stock} unidades de ${product.name}.`,
      });
    }
    if (qty > 0) lines.push({ product, qty, options: item.options });
  }

  const quote = calculateQuote({
    lines,
    promotions,
    couponCode,
    paymentMethod,
    installments,
    settings: storeSettings,
  });

  return { quote: { ...quote, warnings }, lines };
}
