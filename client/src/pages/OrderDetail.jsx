import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { formatDate, formatPrice, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '../utils/format.js';

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, error, loading } = useApi(`/orders/${id}`);

  if (loading) return <div className="container page-loading" aria-busy="true" />;
  if (error) {
    return (
      <div className="container empty">
        <h1 className="page-title">No encontramos ese pedido</h1>
        <Link className="button" to="/cuenta">
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  const paid = order.payment.status === 'approved';
  const rejected = order.payment.status === 'rejected';

  return (
    <div className="order container">
      <header className="order__header">
        <h1 className="page-title">
          {paid ? '¡Gracias por tu compra!' : rejected ? 'El pago no se aprobó' : 'Recibimos tu pedido'}
        </h1>
        <p>
          Pedido <strong>{order.number}</strong> del {formatDate(order.createdAt)}. Estado:{' '}
          {ORDER_STATUS_LABELS[order.status]}.
        </p>
      </header>

      {order.payment.instructions && (
        <div className="notice notice--info">
          <h2>Cómo pagar</h2>
          <p>{order.payment.instructions}</p>
        </div>
      )}
      {rejected && (
        <div className="notice notice--error" role="alert">
          <p>El medio de pago rechazó la operación. Podés intentar de nuevo con otro medio desde el carrito.</p>
        </div>
      )}

      <div className="order__grid">
        <section aria-labelledby="order-items">
          <h2 id="order-items">Productos</h2>
          <ul className="order__items">
            {order.items.map((item) => (
              <li key={`${item.slug}-${JSON.stringify(item.options)}`}>
                <span>
                  {item.qty} × {item.name}
                  {item.options && Object.keys(item.options).length > 0 && (
                    <small> ({Object.values(item.options).join(', ')})</small>
                  )}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="order-totals">
          <h2 id="order-totals">Pago</h2>
          <dl className="summary__rows">
            <div>
              <dt>Medio</dt>
              <dd>
                {PAYMENT_LABELS[order.payment.method]}
                {order.payment.cardBrand && ` · ${order.payment.cardBrand}`}
              </dd>
            </div>
            {order.pricing.discountTotal + (order.pricing.paymentDiscount?.amount ?? 0) > 0 && (
              <div>
                <dt>Descuentos</dt>
                <dd>−{formatPrice(order.pricing.discountTotal + (order.pricing.paymentDiscount?.amount ?? 0))}</dd>
              </div>
            )}
            <div>
              <dt>Envío</dt>
              <dd>{order.pricing.shipping === 0 ? 'Gratis' : formatPrice(order.pricing.shipping)}</dd>
            </div>
            <div className="summary__total">
              <dt>Total</dt>
              <dd>{formatPrice(order.pricing.total)}</dd>
            </div>
          </dl>
          {order.pricing.financing?.count > 1 && (
            <p>
              {order.pricing.financing.count} cuotas de {formatPrice(order.pricing.financing.installmentAmount)}
            </p>
          )}
        </section>

        <section aria-labelledby="order-address">
          <h2 id="order-address">Envío</h2>
          <address>
            {order.shippingAddress.name}
            <br />
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.province} ({order.shippingAddress.zip})
          </address>
        </section>
      </div>

      <div className="order__actions">
        <Link className="button" to="/cuenta">
          Ver mis pedidos
        </Link>
        <Link className="button button--ghost" to="/tienda">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
