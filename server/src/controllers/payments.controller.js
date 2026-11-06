import { Order } from '../models/Order.js';
import { paymentProvider } from '../services/payments/index.js';

// Mercado Pago avisa cambios de estado. Respondemos 200 rápido y siempre
// consultamos el pago a la API (nunca confiamos en el cuerpo del webhook).
export async function mercadoPagoWebhook(req, res) {
  if (paymentProvider.name !== 'mercadopago') return res.sendStatus(200);
  if (!paymentProvider.verifyWebhook(req)) return res.sendStatus(401);

  const type = req.query.type ?? req.body?.type;
  const paymentId = req.query['data.id'] ?? req.body?.data?.id;
  if (type !== 'payment' || !paymentId) return res.sendStatus(200);

  const result = await paymentProvider.getPaymentStatus(paymentId);
  const order = result?.orderId ? await Order.findById(result.orderId) : null;
  if (!order || order.payment.status === result.status) return res.sendStatus(200);

  order.payment.status = result.status;
  order.payment.providerId = result.providerId;
  if (result.status === 'approved' && order.status === 'pending_payment') {
    order.setStatus('paid', 'Pago aprobado por Mercado Pago');
  }
  if (result.status === 'rejected') {
    order.timeline.push({ status: order.status, note: 'Pago rechazado' });
  }
  await order.save();
  res.sendStatus(200);
}
