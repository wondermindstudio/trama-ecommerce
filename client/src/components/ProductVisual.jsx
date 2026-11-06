import ProductArt from './ProductArt.jsx';

// Foto real si existe; si no, la ilustración de la marca.
export default function ProductVisual({ product, size = 'card' }) {
  if (product.images?.length) {
    return (
      <img
        className={`product-visual product-visual--${size}`}
        src={product.images[0]}
        alt={product.name}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`product-visual product-visual--${size}`}>
      <ProductArt product={product} />
    </div>
  );
}
