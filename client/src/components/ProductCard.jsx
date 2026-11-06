import { Link } from 'react-router-dom';
import ProductVisual from './ProductVisual.jsx';
import Price from './Price.jsx';
import { brand } from '../brand.js';

export default function ProductCard({ product }) {
  const detail = brand.cardDetail?.(product);
  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="product-card__link">
        <ProductVisual product={product} />
        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          {detail && <p className="product-card__detail">{detail}</p>}
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        </div>
      </Link>
    </article>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="product-card product-card--skeleton">
          <div className="product-visual product-visual--card skeleton" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
