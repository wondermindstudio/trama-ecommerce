import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    slug: String,
    name: String,
    price: Number,
    qty: Number,
    options: { type: Map, of: String },
    lineTotal: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [itemSchema],
    pricing: {
      subtotal: Number,
      discounts: [{ _id: false, label: String, amount: Number, code: String }],
      discountTotal: Number,
      shipping: Number,
      paymentDiscount: { label: String, amount: Number },
      financing: {
        count: Number,
        interestRate: Number,
        surcharge: Number,
        installmentAmount: Number,
      },
      total: Number,
    },
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      province: String,
      zip: String,
      phone: String,
    },
    payment: {
      method: String,
      cardBrand: String,
      provider: String,
      providerId: String,
      checkoutUrl: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'refunded'],
        default: 'pending',
      },
      instructions: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment' },
    timeline: [{ _id: false, status: String, at: { type: Date, default: Date.now }, note: String }],
  },
  { timestamps: true },
);

orderSchema.methods.setStatus = function setStatus(status, note) {
  this.status = status;
  this.timeline.push({ status, note });
};

orderSchema.set('toJSON', {
  flattenMaps: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model('Order', orderSchema);
