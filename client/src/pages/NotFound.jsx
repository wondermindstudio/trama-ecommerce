import { Link } from 'react-router-dom';
import { brand } from '../brand.js';

export default function NotFound() {
  return (
    <div className="container empty">
      <h1 className="page-title">Esta página no existe</h1>
      <p>{brand.copy.notFound}</p>
      <Link to="/tienda" className="button button--primary">
        Ir a la tienda
      </Link>
    </div>
  );
}
