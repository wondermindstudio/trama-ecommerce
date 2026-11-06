import { buildQuote } from '../services/cart.service.js';
import { PAYMENT_METHODS } from '../services/pricing.js';
import { storeSettings } from '../config/store.js';

export async function quote(req, res) {
  const { quote } = await buildQuote(req.body);
  res.json(quote);
}

export function settings(_req, res) {
  res.json({
    ...storeSettings,
    paymentMethods: Object.entries(PAYMENT_METHODS).map(([id, label]) => ({ id, label })),
  });
}
