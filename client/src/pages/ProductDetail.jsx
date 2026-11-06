import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../store/cart.js';
import ProductVisual from '../components/ProductVisual.jsx';
import Price from '../components/Price.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import { formatPrice } from '../utils/format.js';
import { brand } from '../brand.js';

function promoAppliesTo(promo, product) {
  const cats = promo.scope?.categories ?? [];
  const slugs = promo.scope?.productSlugs ?? [];
  if (promo.type === 'payment_method') return true;
  if (cats.length === 0 && slugs.length === 0) return true;
  return cats.includes(product.category) || slugs.includes(product.slug);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, error, loading } = useApi(`/products/${slug}`);
  const { data: promos } = useApi('/promotions/active');
  const { data: settings } = useApi('/store/settings');
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState({});
  const [qty, setQty] = useState(1);
  const [missing, setMissing] = useState([]);

  useEffect(() => {
    if (product) document.title = `${product.name} · ${brand.name}`;
    setSelected({});
    setQty(1);
    setMissing([]);
  }, [product]);

  if (loading) return <div className="container page-loading" aria-busy="true" />;
  if (error) {
    return (
      <div className="container empty">
        <h1 className="page-title">Producto no disponible</h1>
        <p>{error.message}</p>
        <Link className="button" to="/tienda">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const applicable = (promos ?? []).filter((p) => promoAppliesTo(p, product));
  const maxNoInterest = settings?.installmentPlans
    ?.filter((p) => p.interestRate === 0)
    .reduce((max, p) => Math.max(max, p.count), 1);
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    const lacking = product.options.filter((o) => !selected[o.name]).map((o) => o.name);
    setMissing(lacking);
    if (lacking.length) return;
    add(product, selected, qty);
  };

  return (
    <div className="product container">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/tienda">{brand.nav.all}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/tienda?categoria=${product.category}`}>
          {brand.categories[product.category] ?? product.category}
        </Link>
      </nav>

      <div className="product__layout">
        <div className="product__media">
          <ProductVisual product={product} size="detail" />
        </div>

        <div className="product__info">
          <h1 className="product__name">{product.name}</h1>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} className="price--lg" />
          {maxNoInterest > 1 && (
            <p className="product__installments">
              {maxNoInterest} cuotas sin interés de {formatPrice(Math.ceil(product.price / maxNoInterest))}
            </p>
          )}

          <p className="product__description">{product.description}</p>

          {applicable.length > 0 && (
            <ul className="product__promos" aria-label="Promociones">
              {applicable.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          )}

          {product.options.map((option) => (
            <fieldset key={option.name} className="option">
              <legend>
                {option.name}
                {selected[option.name] && <span className="option__current">: {selected[option.name]}</span>}
              </legend>
              <div className="option__values">
                {option.values.map((value) => (
                  <label key={value} className="option__value">
                    <input
                      type="radio"
                      name={option.name}
                      value={value}
                      checked={selected[option.name] === value}
                      onChange={() => {
                        setSelected((s) => ({ ...s, [option.name]: value }));
                        setMissing((m) => m.filter((n) => n !== option.name));
                      }}
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
              {missing.includes(option.name) && (
                <p className="field__error" role="alert">
                  Elegí {option.name.toLowerCase()} para continuar.
                </p>
              )}
            </fieldset>
          ))}

          <div className="product__buy">
            {!outOfStock && (
              <QuantityStepper value={qty} onChange={setQty} max={Math.min(product.stock, 20)} />
            )}
            <button type="button" className="button button--primary" onClick={handleAdd} disabled={outOfStock}>
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
          {!outOfStock && product.stock <= 5 && (
            <p className="product__stock">Quedan {product.stock} unidades.</p>
          )}

          {Object.keys(product.attributes ?? {}).length > 0 && (
            <dl className="product__attributes">
              {Object.entries(product.attributes).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{brand.formatAttribute?.(k, v) ?? v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
