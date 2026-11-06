import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '../utils/format.js';
import { brand } from '../brand.js';

export default function Account() {
  const { user, logout } = useAuth();
  const { data: orders, loading, error } = useApi('/orders/mine');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Mi cuenta · ${brand.name}`;
  }, []);

  return (
    <div className="account container">
      <header className="account__header">
        <h1 className="page-title">Hola, {user.name.split(' ')[0]}</h1>
        <button
          type="button"
          className="button button--ghost"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <section aria-labelledby="mis-pedidos">
        <h2 id="mis-pedidos">Mis pedidos</h2>
        {loading && <div className="page-loading" aria-busy="true" />}
        {error && <p role="alert">{error.message}</p>}
        {orders?.length === 0 && (
          <div className="empty">
            <p>Todavía no hiciste ninguna compra.</p>
            <Link className="button button--primary" to="/tienda">
              Ir a la tienda
            </Link>
          </div>
        )}
        {orders?.length > 0 && (
          <table className="orders-table">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/pedido/${o.id}`}>{o.number}</Link>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{ORDER_STATUS_LABELS[o.status]}</td>
                  <td>{formatPrice(o.pricing.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {user.address && (
        <section aria-labelledby="mi-direccion">
          <h2 id="mi-direccion">Dirección guardada</h2>
          <address>
            {user.address.street}, {user.address.city}, {user.address.province} ({user.address.zip})
          </address>
        </section>
      )}
    </div>
  );
}
