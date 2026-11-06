// Configuración comercial de Trama. Montos en pesos enteros.
export const storeSettings = {
  currency: 'ARS',
  shippingFlat: 7500,
  freeShippingFrom: 150000,
  // interestRate: recargo total sobre el precio (0 = sin interés)
  installmentPlans: [
    { count: 1, interestRate: 0 },
    { count: 3, interestRate: 0 },
    { count: 6, interestRate: 0 },
    { count: 12, interestRate: 0.28 },
  ],
  cardBrands: ['Visa', 'Mastercard', 'American Express', 'Naranja X', 'Cabal'],
};
