import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart.js';
import { useQuote } from '../hooks/useQuote.js';
import ProductVisual from '../components/ProductVisual.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import Summary from '../components/Summary.jsx';
import { formatPrice } from '../utils/format.js';
import { brand } from '../brand.js';

export default function Cart() {
  const { items, setQty, remove, couponCode, setCoupon } = useCart();
  const { quote, error } = useQuote();
  const [couponInput, setCouponInput] = useState(couponCode);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Carrito · ${brand.name}`;
  }, []);

  // Si el cupón no es válido, lo quitamos del carrito pero mostramos el motivo.
  const couponError = couponCode && quote?.couponError;

  if (items.length === 0) {
    return (
      <div className="container empty">
        <h1 className="page-title">Tu carrito está vacío</h1>
        <p>{brand.copy.emptyCart}</p>
        <Link to="/tienda" className="button button--primary">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="cart container">
      <h1 className="page-title">Carrito</h1>

      <div className="cart__layout">
        <ul className="cart__lines">
          {items.map((item) => (
            <li key={item.key} className="cart-line">
              <Link to={`/producto/${item.slug}`} className="cart-line__media" tabIndex={-1}>
                <ProductVisual product={item} size="thumb" />
              </Link>
              <div className="cart-line__info">
                <Link to={`/producto/${item.slug}`} className="cart-line__name">
                  {item.name}
                </Link>
                {Object.entries(item.options).length > 0 && (
                  <p className="cart-line__options">
                    {Object.entries(item.options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </p>
                )}
                <p className="cart-line__unit">{formatPrice(item.price)} c/u</p>
              </div>
              <QuantityStepper
                value={item.qty}
                min={1}
                onChange={(q) => setQty(item.key, q)}
                label={`Cantidad de ${item.name}`}
              />
              <p className="cart-line__total">{formatPrice(item.price * item.qty)}</p>
              <button type="button" className="link-button" onClick={() => remove(item.key)}>
                Quitar<span className="visually-hidden"> {item.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart__aside">
          {quote?.warnings?.length > 0 && (
            <div className="notice notice--warning" role="status">
              {quote.warnings.map((w) => (
                <p key={w.slug}>{w.message}</p>
              ))}
            </div>
          )}

          <form
            className="coupon"
            onSubmit={(e) => {
              e.preventDefault();
              setCoupon(couponInput.trim().toUpperCase());
            }}
          >
            <label htmlFor="cupon">Código de descuento</label>
            <div className="coupon__row">
              <input
                id="cupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                autoComplete="off"
                aria-describedby={couponError ? 'cupon-error' : undefined}
                aria-invalid={Boolean(couponError)}
              />
              <button type="submit" className="button button--ghost">
                Aplicar
              </button>
            </div>
            {couponError && (
              <p id="cupon-error" className="field__error" role="alert">
                {couponError}
              </p>
            )}
            {quote?.appliedCoupon && (
              <p className="coupon__ok" role="status">
                Código {quote.appliedCoupon} aplicado.{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setCoupon('');
                    setCouponInput('');
                  }}
                >
                  Quitar código
                </button>
              </p>
            )}
          </form>

          {error && (
            <p className="notice notice--error" role="alert">
              {error.message}
            </p>
          )}

          <Summary quote={quote}>
            <button
              type="button"
              className="button button--primary button--block"
              onClick={() => navigate('/checkout')}
              disabled={!quote || quote.items.length === 0}
            >
              Continuar con la compra
            </button>
            <p className="summary__note">Elegís el medio de pago y las cuotas en el siguiente paso.</p>
          </Summary>
        </aside>
      </div>
    </div>
  );
}
