import { formatPrice } from '../utils/format.js';

/** Desglose de montos calculado por el backend (POST /api/cart/quote). */
export default function Summary({ quote, children }) {
  if (!quote) return null;
  const missingForFree =
    quote.freeShippingFrom && quote.shipping > 0
      ? quote.freeShippingFrom - (quote.subtotal - quote.discountTotal)
      : 0;

  return (
    <section className="summary" aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo" className="summary__title">
        Resumen
      </h2>
      <dl className="summary__rows">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(quote.subtotal)}</dd>
        </div>
        {quote.discounts.map((d) => (
          <div key={d.label} className="summary__discount">
            <dt>{d.label}</dt>
            <dd>−{formatPrice(d.amount)}</dd>
          </div>
        ))}
        {quote.paymentDiscount && (
          <div className="summary__discount">
            <dt>{quote.paymentDiscount.label}</dt>
            <dd>−{formatPrice(quote.paymentDiscount.amount)}</dd>
          </div>
        )}
        <div>
          <dt>Envío</dt>
          <dd>{quote.shipping === 0 ? 'Gratis' : formatPrice(quote.shipping)}</dd>
        </div>
        {quote.financing?.surcharge > 0 && (
          <div>
            <dt>Interés por {quote.financing.count} cuotas</dt>
            <dd>{formatPrice(quote.financing.surcharge)}</dd>
          </div>
        )}
        <div className="summary__total">
          <dt>Total</dt>
          <dd>{formatPrice(quote.total)}</dd>
        </div>
      </dl>
      {quote.financing?.count > 1 && (
        <p className="summary__installments">
          {quote.financing.count} cuotas de {formatPrice(quote.financing.installmentAmount)}
          {quote.financing.interestRate === 0 ? ' sin interés' : ''}
        </p>
      )}
      {missingForFree > 0 && (
        <p className="summary__hint">Sumá {formatPrice(missingForFree)} y el envío es gratis.</p>
      )}
      {children}
    </section>
  );
}
