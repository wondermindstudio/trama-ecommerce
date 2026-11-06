import { env } from '../../config/env.js';
import { mockProvider } from './mock.js';

// Patrón strategy: el resto de la app no sabe qué proveedor está activo.
// Mercado Pago se importa solo si se usa, así el modo demo no necesita credenciales.
let provider = mockProvider;
if (env.PAYMENT_PROVIDER === 'mercadopago') {
  ({ mercadoPagoProvider: provider } = await import('./mercadopago.js'));
}

export const paymentProvider = provider;
