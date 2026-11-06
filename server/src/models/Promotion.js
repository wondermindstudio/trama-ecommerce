import mongoose from 'mongoose';

export const PROMOTION_TYPES = [
  'percentage', // % de descuento sobre los productos alcanzados
  'fixed', // monto fijo de descuento
  'buy_x_pay_y', // 2x1, 3x2... regala las unidades más baratas
  'free_shipping', // envío gratis desde un mínimo
  'payment_method', // % de descuento por pagar con un medio (p. ej. transferencia)
];

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: PROMOTION_TYPES, required: true },
    // Si tiene código es un cupón; si no, se aplica sola cuando corresponde.
    code: { type: String, uppercase: true, trim: true, unique: true, sparse: true },
    value: { type: Number, default: 0 }, // % o monto según el tipo
    buyQty: Number,
    payQty: Number,
    minSubtotal: { type: Number, default: 0 },
    scope: {
      categories: [String],
      productSlugs: [String],
    },
    paymentMethods: [String],
    active: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true },
);

promotionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Promotion = mongoose.model('Promotion', promotionSchema);
