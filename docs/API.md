# API de Trama

Base: `/api`. Respuestas en JSON. Los errores siempre tienen `{ message, details? }`.
🔒 = requiere sesión · 🛡️ = requiere rol admin.

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Crea la cuenta y deja la sesión iniciada (cookie). |
| POST | `/auth/login` | Inicia sesión. Limitado a 20 intentos cada 15 min. |
| POST | `/auth/logout` | Cierra la sesión. |
| GET 🔒 | `/auth/me` | Usuario actual. |
| PATCH 🔒 | `/auth/me` | Actualiza nombre o dirección. |

## Catálogo

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/products?category=&q=&sort=&minPrice=&maxPrice=&page=&limit=&featured=` | Listado paginado. `sort`: `featured`, `newest`, `price_asc`, `price_desc`. |
| GET | `/products/categories` | Categorías con cantidad de productos. |
| GET | `/products/:slug` | Detalle. |
| POST 🛡️ | `/products` | Alta. |
| PATCH 🛡️ | `/products/:id` | Edición parcial. |
| DELETE 🛡️ | `/products/:id` | Baja lógica (`active: false`). |

## Carrito, promociones y configuración

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/store/settings` | Envío, cuotas, tarjetas y medios de pago. |
| POST | `/cart/quote` | Cotiza el carrito: descuentos, envío, descuento por medio de pago y cuotas. |
| GET | `/promotions/active` | Promociones automáticas vigentes (no lista cupones). |
| GET/POST/PATCH/DELETE 🛡️ | `/promotions` | ABM de promociones y cupones. |

Ejemplo de `POST /cart/quote`:

```json
{
  "items": [{ "slug": "producto", "qty": 3, "options": { "Talle": "M" } }],
  "couponCode": "CODIGO",
  "paymentMethod": "credit_card",
  "installments": 6
}
```

Tipos de promoción: `percentage`, `fixed`, `buy_x_pay_y` (2x1, 3x2), `free_shipping`, `payment_method`.
Pueden limitarse a categorías o productos (`scope`), tener mínimo de compra y fechas de vigencia.

## Pedidos y pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST 🔒 | `/orders` | Crea el pedido, descuenta stock y genera el pago. |
| GET 🔒 | `/orders/mine` | Pedidos del usuario. |
| GET 🔒 | `/orders/:id` | Detalle (dueño o admin). |
| GET 🛡️ | `/orders?status=` | Todos los pedidos. |
| PATCH 🛡️ | `/orders/:id/status` | Cambia el estado. Cancelar devuelve el stock. |
| POST | `/payments/webhook/mercadopago` | Notificaciones de Mercado Pago (firma verificada). |

Estados del pedido: `pending_payment` → `paid` → `preparing` → `shipped` → `delivered` (o `cancelled`).
