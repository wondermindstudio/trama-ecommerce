# Trama · Ropa esencial de fibras naturales

Tienda online de ropa esencial de lino, algodón orgánico y lana, cortada y cosida en Buenos Aires.

E-commerce full-stack (MERN) hecho como proyecto de portfolio: catálogo con filtros y búsqueda,
carrito con promociones, checkout con tarjetas, cuotas, Mercado Pago, transferencia y efectivo,
cuentas de usuario y panel de pedidos.

**Demo:** _agregá acá el link cuando lo publiques_ · **Tablero:** importá `jira/trama-jira.csv` en Jira

## Funcionalidades

- **Catálogo:** búsqueda de texto, filtros por categoría, orden y paginación. Variantes por producto (talles).
- **Carrito con promociones:** 3x2 en remeras, 15% en abrigos, 10% por transferencia y cupón de bienvenida. Todos los montos se calculan en el servidor.
- **Checkout:** Visa, Mastercard, American Express, Naranja X y Cabal; cuotas 3 y 6 sin interés o 12 con interés; débito, Mercado Pago, transferencia y efectivo.
- **Autenticación:** registro e inicio de sesión con JWT en cookie httpOnly, rutas protegidas, roles cliente y admin.
- **Pedidos:** reserva atómica de stock, número de pedido, historial y estados con línea de tiempo.
- **Accesibilidad:** navegación por teclado, foco visible, etiquetas en formularios, regiones `aria-live`, contraste AA y `prefers-reduced-motion`.
- **Responsive:** diseñado desde 360 px.

## Stack

React 19 · Vite · React Router 7 · Zustand · Node.js 22 · Express 5 · MongoDB · Mongoose · Zod · JWT · Mercado Pago · GitHub Actions.
Por qué cada uno y qué se usa hoy en la industria: [docs/STACK.md](docs/STACK.md).

## Correr en local

Requisitos: Node.js 22 y Docker (o una base en MongoDB Atlas).

```bash
npm install                      # instala front y API (npm workspaces)
docker compose up -d             # MongoDB local en el puerto 27017
cp server/.env.example server/.env
npm run seed                     # carga productos, promociones y el usuario admin
npm run dev                      # API en :4000 y front en http://localhost:5173
```

Usuario admin de demo: `admin@trama.dev` / `Admin1234!` (cambialo con `SEED_ADMIN_PASSWORD`).
Cupones para probar: `BIENVENIDA10`.

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Front y API con recarga automática |
| `npm run seed` | Reinicia catálogo y promociones con los datos de demo |
| `npm test` | Tests del motor de precios y promociones |
| `npm run lint` | ESLint en front y API |
| `npm run build` | Compila el front para producción |

## Estructura

```
├── client/                 React + Vite
│   └── src/
│       ├── pages/          Home, Catálogo, Producto, Carrito, Checkout, Pedido, Cuenta, Login
│       ├── components/     Layout, ProductCard, ProductArt (ilustraciones), Summary…
│       ├── store/cart.js   Carrito persistente (Zustand)
│       ├── brand.js        Textos y categorías de la marca
│       └── styles/         theme.css (tokens de marca) + base.css (estructura)
├── server/                 Node + Express
│   ├── src/
│   │   ├── models/         User, Product, Promotion, Order
│   │   ├── controllers/    Lógica de cada recurso
│   │   ├── services/       pricing.js (promociones), payments/ (mock y Mercado Pago)
│   │   └── seed/           Datos de demo
│   └── tests/
├── brand/                  Logo y favicon en SVG
├── docs/                   Marca, stack, API, deploy y Git
└── jira/                   Backlog para importar en Jira
```

## Documentación

- [Manual de marca](docs/BRAND.md)
- [Stack y decisiones técnicas](docs/STACK.md)
- [Referencia de la API](docs/API.md)
- [Hosting, dominio y pagos reales](docs/DEPLOY.md)
- [Flujo de Git y GitHub](docs/GIT.md)
- [Importar el backlog en Jira](jira/COMO-IMPORTAR.md)

---

Proyecto de portfolio. Las imágenes de producto son ilustraciones SVG generadas en código; para usar fotos,
cargá URLs en el campo `images` de cada producto.
