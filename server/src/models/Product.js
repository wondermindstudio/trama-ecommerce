import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // p. ej. "Talle", "Molienda", "Color"
    values: [{ type: String, required: true }],
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    // Precios en pesos enteros (sin decimales) para evitar errores de coma flotante.
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    options: [optionSchema],
    // Datos propios de cada rubro: composición, origen, especificaciones, etc.
    attributes: { type: Map, of: String, default: {} },
    tags: [{ type: String, lowercase: true }],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    // Ilustración SVG generada en el frontend mientras no haya fotos reales.
    art: {
      kind: String,
      color: String,
      accent: String,
    },
    // URLs de fotos reales (Cloudinary, S3...). Si existen, reemplazan la ilustración.
    images: [{ type: String }],
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ active: 1, featured: -1, createdAt: -1 });

productSchema.set('toJSON', {
  flattenMaps: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model('Product', productSchema);
