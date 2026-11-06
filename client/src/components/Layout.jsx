import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart, selectCount } from '../store/cart.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { brand } from '../brand.js';

function AddedToast() {
  const lastAdded = useCart((s) => s.lastAdded);
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (!lastAdded || Date.now() - lastAdded.at > 2000) return undefined;
    setVisible(lastAdded);
    const t = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(t);
  }, [lastAdded]);

  return (
    <div className="toast-region" aria-live="polite">
      {visible && (
        <div className="toast" key={visible.at}>
          <span>Agregaste {visible.name} al carrito.</span>
          <Link to="/carrito">Ver carrito</Link>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const count = useCart(selectCount);
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__logo" aria-label={`${brand.name}, inicio`}>
            <Logo />
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-principal"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? 'Cerrar' : 'Menú'}
          </button>

          <nav
            id="nav-principal"
            className={`site-nav ${menuOpen ? 'is-open' : ''}`}
            aria-label="Principal"
            onClick={() => setMenuOpen(false)}
          >
            <NavLink to="/tienda" end>
              {brand.nav.all}
            </NavLink>
            {Object.entries(brand.categories).map(([slug, label]) => (
              <NavLink key={slug} to={`/tienda?categoria=${slug}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <NavLink to={user ? '/cuenta' : '/ingresar'}>{user ? 'Mi cuenta' : 'Ingresar'}</NavLink>
            <NavLink to="/carrito" className="cart-link">
              Carrito <span className="cart-link__count" aria-label={`${count} productos`}>{count}</span>
            </NavLink>
          </div>
        </div>
      </header>

      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <Logo />
            <p className="site-footer__about">{brand.footer.about}</p>
          </div>
          <div>
            <h2 className="site-footer__title">Comprar</h2>
            <ul>
              {Object.entries(brand.categories).map(([slug, label]) => (
                <li key={slug}>
                  <Link to={`/tienda?categoria=${slug}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="site-footer__title">Ayuda</h2>
            <ul>
              {brand.footer.help.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="site-footer__legal">
          © {new Date().getFullYear()} {brand.name}. Proyecto de portfolio: los pagos funcionan en modo demostración.
        </p>
      </footer>
      <AddedToast />
    </>
  );
}
