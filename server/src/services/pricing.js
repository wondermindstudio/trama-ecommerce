/**
 * Motor de precios y promociones.
 *
 * Funciones puras (sin base de datos ni red): reciben productos, promociones y
 * configuración, y devuelven el detalle completo del carrito. Es la única fuente
 * de verdad de los montos: el frontend solo muestra lo que calcula este módulo.
 */

export const PAYMENT_METHODS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia bancaria',
  cash: 'Efectivo (Rapipago / Pago Fácil)',
};

const round = (n) => Math.round(n);

export function isPromotionLive(promo, now = new Date()) {
  if (!promo.active) return false;
  if (promo.startsAt && new Date(promo.startsAt) > now) return false;
  if (promo.endsAt && new Date(promo.endsAt) < now) return false;
  return true;
}

function matchesScope(promo, product) {
  const categories = promo.scope?.categories ?? [];
  const slugs = promo.scope?.productSlugs ?? [];
  if (categories.length === 0 && slugs.length === 0) return true;
  return categories.includes(product.category) || slugs.includes(product.slug);
}

function discountFor(promo, items, subtotal) {
  if (subtotal < (promo.minSubtotal ?? 0)) return 0;
  const eligible = items.filter((item) => matchesScope(promo, item.product));
  const eligibleSubtotal = eligible.reduce((sum, item) => sum + item.lineTotal, 0);
  if (eligibleSubtotal === 0) return 0;

  switch (promo.type) {
    case 'percentage':
      return round((eligibleSubtotal * promo.value) / 100);
    case 'fixed':
      return Math.min(promo.value, eligibleSubtotal);
    case 'buy_x_pay_y': {
      const { buyQty, payQty } = promo;
      if (!buyQty || payQty == null || payQty >= buyQty) return 0;
      // Se bonifican las unidades más baratas, como en cualquier 2x1 o 3x2.
      const unitPrices = eligible
        .flatMap((item) => Array(item.qty).fill(item.product.price))
        .sort((a, b) => a - b);
      const freeUnits = Math.floor(unitPrices.length / buyQty) * (buyQty - payQty);
      return unitPrices.slice(0, freeUnits).reduce((sum, p) => sum + p, 0);
    }
    default:
      return 0;
  }
}

/**
 * @param {object} input
 * @param {Array<{product: object, qty: number, options?: object}>} input.lines
 * @param {Array<object>} [input.promotions] promociones vigentes y no vigentes
 * @param {string} [input.couponCode]
 * @param {string} [input.paymentMethod] clave de PAYMENT_METHODS
 * @param {number} [input.installments] cantidad de cuotas (solo crédito)
 * @param {object} input.settings { shippingFlat, freeShippingFrom, installmentPlans }
 * @param {Date} [input.now]
 */
export function calculateQuote({
  lines,
  promotions = [],
  couponCode,
  paymentMethod,
  installments = 1,
  settings,
  now = new Date(),
}) {
  const items = lines
    .filter((line) => line.qty > 0)
    .map((line) => ({
      product: line.product,
      qty: line.qty,
      options: line.options ?? {},
      lineTotal: line.product.price * line.qty,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const live = promotions.filter((promo) => isPromotionLive(promo, now));
  const code = couponCode?.trim().toUpperCase() || null;

  // 1. Promociones automáticas + el cupón ingresado (un solo cupón por compra).
  let couponError = null;
  let appliedCoupon = null;
  const candidates = live.filter(
    (p) => !p.code && !['payment_method', 'free_shipping'].includes(p.type),
  );

  if (code) {
    const coupon = live.find((p) => p.code === code);
    if (!coupon) {
      couponError = 'El código no existe o ya venció.';
    } else if (subtotal < (coupon.minSubtotal ?? 0)) {
      couponError = `Este código se aplica en compras desde $${coupon.minSubtotal.toLocaleString('es-AR')}.`;
    } else {
      appliedCoupon = coupon.code;
      if (coupon.type !== 'free_shipping') candidates.push(coupon);
    }
  }

  const discounts = [];
  for (const promo of candidates) {
    const amount = discountFor(promo, items, subtotal);
    if (amount > 0) discounts.push({ label: promo.name, amount, code: promo.code ?? undefined });
  }

  if (code && appliedCoupon && !couponError) {
    const coupon = live.find((p) => p.code === code);
    const gaveDiscount = discounts.some((d) => d.code === code);
    if (coupon.type !== 'free_shipping' && !gaveDiscount) {
      couponError = 'El código no aplica a los productos de tu carrito.';
      appliedCoupon = null;
    }
  }

  const discountTotal = Math.min(
    subtotal,
    discounts.reduce((sum, d) => sum + d.amount, 0),
  );
  const afterDiscounts = subtotal - discountTotal;

  // 2. Envío: gratis desde un mínimo, por promoción automática o por cupón.
  const freeShippingPromo = live.find(
    (p) =>
      p.type === 'free_shipping' &&
      (!p.code || p.code === appliedCoupon) &&
      afterDiscounts >= (p.minSubtotal ?? 0),
  );
  const freeByThreshold =
    settings.freeShippingFrom != null && afterDiscounts >= settings.freeShippingFrom;
  const shipping =
    items.length === 0 || freeByThreshold || freeShippingPromo ? 0 : settings.shippingFlat;

  // 3. Descuento por medio de pago (sobre productos, no sobre el envío).
  let paymentDiscount = null;
  if (paymentMethod) {
    const promo = live.find(
      (p) => p.type === 'payment_method' && p.paymentMethods?.includes(paymentMethod),
    );
    if (promo && afterDiscounts >= (promo.minSubtotal ?? 0)) {
      paymentDiscount = { label: promo.name, amount: round((afterDiscounts * promo.value) / 100) };
    }
  }

  const base = afterDiscounts - (paymentDiscount?.amount ?? 0) + shipping;

  // 4. Cuotas: solo con tarjeta de crédito. Interés según el plan configurado.
  const plans = settings.installmentPlans ?? [{ count: 1, interestRate: 0 }];
  const availableInstallments = plans.map((plan) => {
    const total = round(base * (1 + plan.interestRate));
    return {
      count: plan.count,
      interestRate: plan.interestRate,
      installmentAmount: Math.ceil(total / plan.count),
      total,
    };
  });

  const chosen =
    paymentMethod === 'credit_card'
      ? availableInstallments.find((p) => p.count === Number(installments)) ??
        availableInstallments[0]
      : { count: 1, interestRate: 0, installmentAmount: base, total: base };

  return {
    items: items.map((item) => ({
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price,
      qty: item.qty,
      options: item.options,
      lineTotal: item.lineTotal,
    })),
    subtotal,
    discounts,
    discountTotal,
    shipping,
    freeShippingFrom: settings.freeShippingFrom ?? null,
    paymentDiscount,
    financing: {
      count: chosen.count,
      interestRate: chosen.interestRate,
      surcharge: chosen.total - base,
      installmentAmount: chosen.installmentAmount,
    },
    availableInstallments,
    total: chosen.total,
    appliedCoupon,
    couponError,
  };
}
