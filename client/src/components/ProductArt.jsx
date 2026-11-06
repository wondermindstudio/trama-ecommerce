import { useId } from 'react';

// Siluetas planas de cada prenda, con la textura del tejido encima.
const SHAPES = {
  tee: {
    body: 'M130 115 L172 98 Q200 120 228 98 L270 115 L332 168 L300 208 L270 188 L270 405 L130 405 L130 188 L100 208 L68 168 Z',
    details: ['M172 98 Q200 132 228 98'],
  },
  knit: {
    body: 'M140 122 L172 112 L172 84 L228 84 L228 112 L260 122 L322 172 L338 384 L306 390 L280 212 L278 414 L122 414 L120 212 L94 390 L62 384 L78 172 Z',
    details: ['M172 96 L228 96', 'M122 398 L278 398', 'M310 374 L336 370', 'M64 370 L90 374'],
  },
  shirt: {
    body: 'M134 108 L176 92 L200 122 L224 92 L266 108 L322 172 L334 338 L302 342 L286 204 L282 424 L118 424 L114 204 L98 342 L66 338 L78 172 Z',
    details: ['M176 92 L186 132 L200 122', 'M224 92 L214 132 L200 122', 'M200 122 L200 424', 'M228 190 L258 190 L258 222 L228 222 Z'],
    buttons: [[200, 160], [200, 210], [200, 260], [200, 310], [200, 360]],
  },
  pants: {
    body: 'M128 82 L272 82 L288 432 L222 432 L200 196 L178 432 L112 432 Z',
    details: ['M128 106 L272 106', 'M162 106 L166 168', 'M238 106 L234 168', 'M200 106 L200 196'],
  },
  coat: {
    body: 'M140 86 L180 74 L200 142 L220 74 L260 86 L322 152 L338 402 L306 408 L292 212 L298 452 L102 452 L108 212 L94 408 L62 402 L78 152 Z',
    details: ['M180 74 L160 112 L176 210 L200 142', 'M220 74 L240 112 L224 210 L200 142', 'M200 142 L200 452'],
    buttons: [[182, 250], [218, 250], [182, 310], [218, 310]],
  },
  dress: {
    body: 'M164 80 L186 74 Q200 96 214 74 L236 80 L252 152 L240 204 L304 442 L96 442 L160 204 L148 152 Z',
    details: ['M186 74 Q200 108 214 74', 'M200 96 L200 196'],
    belt: true,
  },
};

export default function ProductArt({ product }) {
  const id = useId().replace(/:/g, '');
  const { kind = 'tee', color = '#d9d2c3', accent = '#1f2a44' } = product.art ?? {};
  const shape = SHAPES[kind] ?? SHAPES.tee;

  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={product.name}>
      <defs>
        <pattern id={`weave-${id}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={accent} opacity="0.07" />
          <rect x="4" y="4" width="4" height="4" fill={accent} opacity="0.07" />
        </pattern>
        <clipPath id={`clip-${id}`}>
          <path d={shape.body} />
        </clipPath>
      </defs>
      <path d={shape.body} fill={color} />
      <rect width="400" height="500" fill={`url(#weave-${id})`} clipPath={`url(#clip-${id})`} />
      <g fill="none" stroke={accent} strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="round">
        <path d={shape.body} />
        {shape.details.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {shape.belt && <rect x="150" y="196" width="100" height="12" fill={accent} opacity="0.75" />}
      {shape.buttons?.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={accent} opacity="0.7" />
      ))}
    </svg>
  );
}
