/**
 * Proveedor de pagos simulado. Permite recorrer todo el flujo de compra sin
 * credenciales, ideal para demos de portfolio.
 * - Tarjetas y Mercado Pago: se aprueban al instante.
 * - Transferencia y efectivo: quedan pendientes con instrucciones.
 */
export const mockProvider = {
  name: 'mock',

  async createCheckout(order) {
    const method = order.payment.method;
    if (method === 'transfer') {
      return {
        status: 'pending',
        providerId: `mock_${order.number}`,
        instructions:
          `Transferí $${order.pricing.total.toLocaleString('es-AR')} al alias trama.tienda ` +
          `indicando el pedido ${order.number}. Lo confirmamos en hasta 24 h hábiles.`,
      };
    }
    if (method === 'cash') {
      return {
        status: 'pending',
        providerId: `mock_${order.number}`,
        instructions:
          `Pagá en Rapipago o Pago Fácil con el código ${order.number.replace(/\D/g, '')}. ` +
          'El cupón vence en 3 días.',
      };
    }
    return { status: 'approved', providerId: `mock_${order.number}` };
  },

  async getPaymentStatus() {
    return null;
  },
};
