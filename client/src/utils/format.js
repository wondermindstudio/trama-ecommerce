const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const formatPrice = (n) => money.format(n ?? 0);

export const formatDate = (d) =>
  new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

export const ORDER_STATUS_LABELS = {
  pending_payment: 'Esperando el pago',
  paid: 'Pago aprobado',
  preparing: 'Preparando tu pedido',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const PAYMENT_LABELS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia bancaria',
  cash: 'Efectivo',
};
