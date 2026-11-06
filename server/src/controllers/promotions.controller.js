import { z } from 'zod';
import { Promotion, PROMOTION_TYPES } from '../models/Promotion.js';
import { AppError } from '../utils/AppError.js';
import { isPromotionLive } from '../services/pricing.js';

export const promotionSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().optional(),
  type: z.enum(PROMOTION_TYPES),
  code: z.string().trim().toUpperCase().optional(),
  value: z.number().min(0).default(0),
  buyQty: z.number().int().min(2).optional(),
  payQty: z.number().int().min(1).optional(),
  minSubtotal: z.number().min(0).default(0),
  scope: z
    .object({ categories: z.array(z.string()).default([]), productSlugs: z.array(z.string()).default([]) })
    .default({}),
  paymentMethods: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

// Público: promociones automáticas vigentes (para banners). Los cupones no se listan.
export async function listActive(_req, res) {
  const promos = await Promotion.find({ active: true, code: { $exists: false } }).lean();
  res.json(
    promos
      .filter((p) => isPromotionLive(p))
      .map(({ _id, name, description, type, value, buyQty, payQty, minSubtotal, scope, paymentMethods }) => ({
        id: _id,
        name,
        description,
        type,
        value,
        buyQty,
        payQty,
        minSubtotal,
        scope,
        paymentMethods,
      })),
  );
}

export async function listAll(_req, res) {
  res.json(await Promotion.find().sort({ createdAt: -1 }));
}

export async function create(req, res) {
  res.status(201).json(await Promotion.create(req.body));
}

export async function update(req, res) {
  const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!promo) throw AppError.notFound();
  res.json(promo);
}

export async function remove(req, res) {
  const promo = await Promotion.findByIdAndDelete(req.params.id);
  if (!promo) throw AppError.notFound();
  res.status(204).end();
}
