import { formatPrice } from '../utils/format.js';

export default function Price({ price, compareAtPrice, className = '' }) {
  const onSale = compareAtPrice && compareAtPrice > price;
  return (
    <p className={`price ${className}`}>
      <span className="price__now">{formatPrice(price)}</span>
      {onSale && (
        <>
          <span className="visually-hidden">, antes </span>
          <s className="price__was">{formatPrice(compareAtPrice)}</s>
        </>
      )}
    </p>
  );
}
