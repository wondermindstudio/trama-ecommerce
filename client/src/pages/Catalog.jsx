import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { toQuery } from '../api/client.js';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import { brand } from '../brand.js';

const SORT_OPTIONS = [
  ['featured', 'Destacados'],
  ['newest', 'Novedades'],
  ['price_asc', 'Menor precio'],
  ['price_desc', 'Mayor precio'],
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = params.get('categoria') ?? '';
  const sort = params.get('orden') ?? 'featured';
  const q = params.get('q') ?? '';
  const page = Number(params.get('pagina') ?? 1);
  const [search, setSearch] = useState(q);

  useEffect(() => setSearch(q), [q]);

  const { data, error, loading, reload } = useApi(
    `/products${toQuery({ category, sort, q, page, limit: 12 })}`,
  );

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('pagina' in changes)) next.delete('pagina');
    setParams(next);
  };

  const title = category ? brand.categories[category] ?? category : brand.nav.all;

  useEffect(() => {
    document.title = `${title} · ${brand.name}`;
  }, [title]);

  return (
    <div className="catalog container">
      <header className="catalog__header">
        <h1 className="page-title">{title}</h1>
        {brand.categoryIntro?.[category || 'all'] && (
          <p className="catalog__intro">{brand.categoryIntro[category || 'all']}</p>
        )}
      </header>

      <div className="catalog__toolbar">
        <form
          role="search"
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search.trim() });
          }}
        >
          <label htmlFor="buscar" className="visually-hidden">
            Buscar productos
          </label>
          <input
            id="buscar"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={brand.searchPlaceholder}
          />
          <button type="submit" className="button button--ghost">
            Buscar
          </button>
        </form>

        <div className="chips" role="group" aria-label="Filtrar por categoría">
          <button type="button" aria-pressed={!category} onClick={() => update({ categoria: '' })}>
            Todo
          </button>
          {Object.entries(brand.categories).map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              aria-pressed={category === slug}
              onClick={() => update({ categoria: slug })}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="sort">
          <span>Ordenar por</span>
          <select value={sort} onChange={(e) => update({ orden: e.target.value })}>
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="catalog__count" aria-live="polite">
        {data && `${data.total} ${data.total === 1 ? 'producto' : 'productos'}`}
        {q && data && ` para “${q}”`}
      </p>

      {loading && <ProductGridSkeleton />}

      {error && (
        <div className="notice notice--error" role="alert">
          <p>{error.message}</p>
          <button type="button" className="button button--ghost" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="empty">
          <p>No hay productos que coincidan con tu búsqueda.</p>
          <button type="button" className="button" onClick={() => setParams({})}>
            Ver todo el catálogo
          </button>
        </div>
      )}

      {data && data.items.length > 0 && !loading && (
        <>
          <div className="product-grid">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {data.pages > 1 && (
            <nav className="pagination" aria-label="Páginas">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === page ? 'page' : undefined}
                  onClick={() => update({ pagina: String(n) })}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
