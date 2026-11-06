// Marca: cuatro hilos que se cruzan por arriba y por abajo, y el nombre en Italiana.
export function WeaveMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="0" y="5" width="24" height="5" fill="currentColor" opacity="0.35" />
      <rect x="0" y="14" width="24" height="5" fill="currentColor" opacity="0.35" />
      <rect x="5" y="0" width="5" height="24" fill="currentColor" />
      <rect x="14" y="0" width="5" height="24" fill="currentColor" />
      <rect x="10" y="5" width="4" height="5" fill="currentColor" opacity="0.35" />
      <rect x="0" y="14" width="5" height="5" fill="currentColor" opacity="0.35" />
      <rect x="5" y="14" width="5" height="5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <WeaveMark />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}
      >
        Trama
      </span>
    </span>
  );
}
