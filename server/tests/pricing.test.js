import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote } from '../src/services/pricing.js';

const settings = {
  shippingFlat: 5000,
  freeShippingFrom: 100000,
  installmentPlans: [
    { count: 1, interestRate: 0 },
    { count: 3, interestRate: 0 },
    { count: 12, interestRate: 0.3 },
  ],
};

const a = { slug: 'a', name: 'Producto A', price: 10000, category: 'uno' };
const b = { slug: 'b', name: 'Producto B', price: 20000, category: 'dos' };

describe('calculateQuote', () => {
  test('suma subtotal y cobra envío por debajo del mínimo', () => {
    const q = calculateQuote({ lines: [{ product: a, qty: 2 }], settings });
    assert.equal(q.subtotal, 20000);
    assert.equal(q.shipping, 5000);
    assert.equal(q.total, 25000);
  });

  test('envío gratis al superar el mínimo', () => {
    const q = calculateQuote({ lines: [{ product: b, qty: 5 }], settings });
    assert.equal(q.shipping, 0);
    assert.equal(q.total, 100000);
  });

  test('carrito vacío no cobra envío', () => {
    const q = calculateQuote({ lines: [], settings });
    assert.equal(q.total, 0);
  });

  test('porcentaje limitado a una categoría', () => {
    const promotions = [
      { name: '20% en uno', type: 'percentage', value: 20, active: true, scope: { categories: ['uno'] } },
    ];
    const q = calculateQuote({
      lines: [{ product: a, qty: 1 }, { product: b, qty: 1 }],
      promotions,
      settings,
    });
    assert.equal(q.discountTotal, 2000);
  });

  test('3x2 bonifica la unidad más barata', () => {
    const promotions = [{ name: '3x2', type: 'buy_x_pay_y', buyQty: 3, payQty: 2, active: true }];
    const q = calculateQuote({
      lines: [{ product: a, qty: 1 }, { product: b, qty: 2 }],
      promotions,
      settings,
    });
    assert.equal(q.discountTotal, 10000);
  });

  test('cupón válido, inexistente y con mínimo', () => {
    const promotions = [
      { name: 'Bienvenida', code: 'HOLA10', type: 'percentage', value: 10, active: true },
      { name: 'Grande', code: 'GRANDE', type: 'fixed', value: 5000, minSubtotal: 50000, active: true },
    ];
    const lines = [{ product: a, qty: 2 }];
    assert.equal(calculateQuote({ lines, promotions, settings, couponCode: 'hola10' }).discountTotal, 2000);
    assert.match(calculateQuote({ lines, promotions, settings, couponCode: 'NOPE' }).couponError, /no existe/);
    assert.match(calculateQuote({ lines, promotions, settings, couponCode: 'GRANDE' }).couponError, /desde/);
  });

  test('promoción vencida no se aplica', () => {
    const promotions = [
      { name: 'Vieja', type: 'percentage', value: 50, active: true, endsAt: '2020-01-01' },
    ];
    const q = calculateQuote({ lines: [{ product: a, qty: 1 }], promotions, settings });
    assert.equal(q.discountTotal, 0);
  });

  test('descuento por transferencia sobre productos, no sobre envío', () => {
    const promotions = [
      { name: '10% transferencia', type: 'payment_method', value: 10, paymentMethods: ['transfer'], active: true },
    ];
    const q = calculateQuote({
      lines: [{ product: a, qty: 2 }],
      promotions,
      settings,
      paymentMethod: 'transfer',
    });
    assert.equal(q.paymentDiscount.amount, 2000);
    assert.equal(q.total, 20000 - 2000 + 5000);
  });

  test('cuotas con interés solo para crédito', () => {
    const lines = [{ product: b, qty: 5 }];
    const credit = calculateQuote({ lines, settings, paymentMethod: 'credit_card', installments: 12 });
    assert.equal(credit.total, 130000);
    assert.equal(credit.financing.installmentAmount, Math.ceil(130000 / 12));
    const debit = calculateQuote({ lines, settings, paymentMethod: 'debit_card', installments: 12 });
    assert.equal(debit.total, 100000);
    assert.equal(debit.financing.count, 1);
  });
});
