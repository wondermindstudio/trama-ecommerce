import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';

const WARP = ['#1f2a44', '#2e3d63', '#3d4f7a', '#4a5d8a'];
const WEFT = ['#f3f1ec', '#e7d6d0', '#d9d2c3', '#c9a9a0'];

// Tejido plano: urdimbre índigo vertical, trama clara horizontal, cruces alternados.
function Weave() {
  const cols = 14;
  const rows = 18;
  const size = 40;
  const thread = 30;
  const off = (size - thread) / 2;
  const crossings = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if ((r + c) % 2 === 0) crossings.push([r, c]);
    }
  }

  return (
    <svg viewBox={`0 0 ${cols * size} ${rows * size}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: cols }, (_, c) => (
        <rect key={`w${c}`} x={c * size + off} y="0" width={thread} height={rows * size} fill={WARP[c % WARP.length]} />
      ))}
      {Array.from({ length: rows }, (_, r) => (
        <rect
          key={`f${r}`}
          className="t-weft"
          style={{ animationDelay: `${r * 45}ms` }}
          x="0"
          y={r * size + off}
          width={cols * size}
          height={thread}
          fill={WEFT[r % WEFT.length]}
        />
      ))}
      {crossings.map(([r, c]) => (
        <rect
          key={`x${r}-${c}`}
          className="t-weft"
          style={{ animationDelay: `${r * 45 + 200}ms` }}
          x={c * size + off}
          y={r * size}
          width={thread}
          height={size}
          fill={WARP[c % WARP.length]}
        />
      ))}
    </svg>
  );
}

const FIBERS = [
  {
    name: 'Lino',
    text: 'Fresco, firme y cada vez más suave. Lo lavamos a la piedra para que llegue listo para usar.',
    q: 'lino',
  },
  {
    name: 'Algodón',
    text: 'Orgánico certificado y pima peruano. Sin suavizantes químicos ni terminaciones plásticas.',
    q: 'algodon',
  },
  {
    name: 'Lana',
    text: 'Merino patagónico y paños con cachemira. Abrigan sin peso y no retienen olores.',
    q: 'lana',
  },
];

export default function Home() {
  const featured = useApi('/products?featured=true&limit=5');
  const promos = useApi('/promotions/active');

  useEffect(() => {
    document.title = 'Trama — Ropa esencial de fibras naturales';
  }, []);

  return (
    <>
      <section className="t-hero" aria-labelledby="hero-title">
        <div className="t-hero__text">
          <h1 id="hero-title" className="t-hero__word">
            Trama
          </h1>
          <p className="t-hero__lede">Ropa esencial de fibras naturales, cortada y cosida en Buenos Aires.</p>
          <div>
            <Link to="/tienda" className="button button--primary">
              Ver la colección
            </Link>
          </div>
        </div>
        <div className="t-hero__weave">
          <Weave />
        </div>
      </section>

      <section className="t-section container" aria-labelledby="destacados">
        <div className="t-section__head">
          <h2 id="destacados">Para esta temporada</h2>
          <Link to="/tienda">Ver todo</Link>
        </div>
        {featured.loading && <ProductGridSkeleton count={5} />}
        {featured.error && <p role="alert">{featured.error.message}</p>}
        {featured.data && (
          <div className="t-featured">
            {featured.data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="t-section container" aria-labelledby="fibras">
        <div className="t-section__head">
          <h2 id="fibras">De qué está hecha</h2>
        </div>
        <div className="t-fibers">
          {FIBERS.map((f) => (
            <article key={f.name} className="t-fiber">
              <h3>{f.name}</h3>
              <p>{f.text}</p>
              <Link to={`/tienda?q=${f.q}`}>Ver prendas de {f.name.toLowerCase()}</Link>
            </article>
          ))}
        </div>
      </section>

      {promos.data?.length > 0 && (
        <section className="t-section t-promos" aria-labelledby="promos">
          <div className="container">
            <div className="t-section__head">
              <h2 id="promos">Promociones vigentes</h2>
              <Link to="/tienda" className="button">
                Comprar
              </Link>
            </div>
            <ul className="t-promos__list">
              {promos.data.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong>
                  {p.description && <span>{p.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
