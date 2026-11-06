import { z } from 'zod';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

const SORTS = {
  featured: { featured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

export const listQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(Object.keys(SORTS)).default('featured'),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  featured: z.enum(['true', 'false']).optional(),
});

export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones.'),
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  stock: z.number().int().min(0),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()).min(1) })).default([]),
  attributes: z.record(z.string()).default({}),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  art: z.object({ kind: z.string(), color: z.string(), accent: z.string().optional() }).optional(),
  images: z.array(z.string().url()).default([]),
});

export async function list(req, res) {
  const { category, q, sort, minPrice, maxPrice, page, limit, featured } = req.validatedQuery;
  const filter = { active: true };
  if (category) filter.category = category;
  if (featured) filter.featured = featured === 'true';
  if (q) filter.$text = { $search: q };
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function categories(_req, res) {
  const rows = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(rows.map((r) => ({ slug: r._id, count: r.count })));
}

export async function getBySlug(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, active: true });
  if (!product) throw AppError.notFound('Ese producto no existe o ya no está disponible.');
  res.json(product);
}

export async function create(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}

export async function update(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw AppError.notFound();
  res.json(product);
}

// Baja lógica: los pedidos históricos siguen referenciando el producto.
export async function remove(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false });
  if (!product) throw AppError.notFound();
  res.status(204).end();
}
