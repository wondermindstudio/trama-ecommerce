import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../store/cart.js';
import { useApi } from '../hooks/useApi.js';
import { useQuote } from '../hooks/useQuote.js';
import Summary from '../components/Summary.jsx';
import { formatPrice } from '../utils/format.js';
import { brand } from '../brand.js';

const METHOD_HINTS = {
  credit_card: 'Hasta en cuotas. Ingresás los datos de la tarjeta en el sitio seguro del procesador de pagos.',
  debit_card: 'Pago en un solo débito.',
  mercadopago: 'Pagás con tu cuenta o saldo de Mercado Pago.',
  transfer: 'Te mostramos el alias al confirmar. Acreditación en hasta 24 h hábiles.',
  cash: 'Te damos un código para pagar en Rapipago o Pago Fácil.',
};

function Field({ id, label, error, wide, ...props }) {
  return (
    <div className={`field ${wide ? 'field--wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  const { user, updateMe } = useAuth();
  const items = useCart((s) => s.items);
  const toPayload = useCart((s) => s.toPayload);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const { data: settings } = useApi('/store/settings');

  const [address, setAddress] = useState({
    name: user.name,
    street: user.address?.street ?? '',
    city: user.address?.city ?? '',
    province: user.address?.province ?? '',
    zip: user.address?.zip ?? '',
    phone: user.address?.phone ?? '',
  });
  const [saveAddress, setSaveAddress] = useState(!user.address);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardBrand, setCardBrand] = useState('');
  const [installments, setInstallments] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { quote } = useQuote({ paymentMethod, installments });

  useEffect(() => {
    document.title = `Finalizar compra · ${brand.name}`;
  }, []);

  if (items.length === 0) {
    return (
      <div className="container empty">
        <h1 className="page-title">No hay nada para pagar</h1>
        <Link to="/tienda" className="button button--primary">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const setField = (key) => (e) => setAddress((a) => ({ ...a, [key]: e.target.value }));

  function validate() {
    const next = {};
    if (address.name.trim().length < 2) next.name = 'Ingresá quién recibe.';
    if (address.street.trim().length < 3) next.street = 'Ingresá calle y número.';
    if (address.city.trim().length < 2) next.city = 'Ingresá la ciudad.';
    if (address.province.trim().length < 2) next.province = 'Ingresá la provincia.';
    if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(address.zip.trim())) next.zip = 'Ingresá un código postal válido, p. ej. 1846.';
    if (paymentMethod === 'credit_card' && !cardBrand) next.cardBrand = 'Elegí la tarjeta.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setSubmitting(true);
    try {
      if (saveAddress) {
        const { name: _name, ...rest } = address;
        await updateMe({ address: rest });
      }
      const order = await api('/orders', {
        method: 'POST',
        body: {
          ...toPayload(),
          paymentMethod,
          installments: paymentMethod === 'credit_card' ? installments : 1,
          cardBrand: paymentMethod === 'credit_card' ? cardBrand : undefined,
          shippingAddress: address,
        },
      });
      clear();
      if (order.payment.checkoutUrl) {
        window.location.assign(order.payment.checkoutUrl);
      } else {
        navigate(`/pedido/${order.id}`, { replace: true });
      }
    } catch (err) {
      setSubmitError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout container">
      <h1 className="page-title">Finalizar compra</h1>
      <form className="checkout__layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout__steps">
          <section className="checkout__step" aria-labelledby="paso-envio">
            <h2 id="paso-envio">Envío</h2>
            <div className="field-grid">
              <Field id="name" label="Recibe" autoComplete="name" value={address.name} onChange={setField('name')} error={errors.name} />
              <Field id="phone" label="Teléfono (opcional)" type="tel" autoComplete="tel" value={address.phone} onChange={setField('phone')} />
              <Field id="street" label="Calle y número" autoComplete="street-address" value={address.street} onChange={setField('street')} error={errors.street} wide />
              <Field id="city" label="Ciudad" autoComplete="address-level2" value={address.city} onChange={setField('city')} error={errors.city} />
              <Field id="province" label="Provincia" autoComplete="address-level1" value={address.province} onChange={setField('province')} error={errors.province} />
              <Field id="zip" label="Código postal" autoComplete="postal-code" inputMode="text" value={address.zip} onChange={setField('zip')} error={errors.zip} />
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
              Guardar esta dirección para próximas compras
            </label>
          </section>

          <section className="checkout__step" aria-labelledby="paso-pago">
            <h2 id="paso-pago">Pago</h2>
            <fieldset className="payment-methods">
              <legend className="visually-hidden">Medio de pago</legend>
              {(settings?.paymentMethods ?? []).map((m) => (
                <label key={m.id} className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => {
                      setPaymentMethod(m.id);
                      setInstallments(1);
                    }}
                  />
                  <span className="payment-method__body">
                    <span className="payment-method__label">{m.label}</span>
                    <span className="payment-method__hint">{METHOD_HINTS[m.id]}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {paymentMethod === 'credit_card' && (
              <div className="card-options">
                <div className="field">
                  <label htmlFor="cardBrand">Tarjeta</label>
                  <select
                    id="cardBrand"
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    aria-invalid={Boolean(errors.cardBrand)}
                    aria-describedby={errors.cardBrand ? 'cardBrand-error' : undefined}
                  >
                    <option value="">Elegí una tarjeta</option>
                    {(settings?.cardBrands ?? []).map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  {errors.cardBrand && (
                    <p id="cardBrand-error" className="field__error">
                      {errors.cardBrand}
                    </p>
                  )}
                </div>

                <fieldset className="installments">
                  <legend>Cuotas</legend>
                  {(quote?.availableInstallments ?? []).map((plan) => (
                    <label key={plan.count} className="installment">
                      <input
                        type="radio"
                        name="installments"
                        value={plan.count}
                        checked={installments === plan.count}
                        onChange={() => setInstallments(plan.count)}
                      />
                      <span>
                        {plan.count === 1 ? '1 pago' : `${plan.count} cuotas`} de {formatPrice(plan.installmentAmount)}
                      </span>
                      <span className="installment__note">
                        {plan.interestRate === 0 ? 'Sin interés' : `Total ${formatPrice(plan.total)}`}
                      </span>
                    </label>
                  ))}
                </fieldset>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout__aside">
          <Summary quote={quote}>
            {submitError && (
              <div className="notice notice--error" role="alert">
                <p>{submitError.message}</p>
                {submitError.status === 409 && <Link to="/carrito">Revisar carrito</Link>}
              </div>
            )}
            <button type="submit" className="button button--primary button--block" disabled={submitting || !quote}>
              {submitting ? 'Confirmando…' : `Pagar ${quote ? formatPrice(quote.total) : ''}`}
            </button>
          </Summary>
        </aside>
      </form>
    </div>
  );
}
