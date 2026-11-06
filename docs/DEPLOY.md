# Publicar Trama: hosting, dominio y pagos

La arquitectura recomendada separa front y API, con planes gratuitos para empezar:

```
 navegador ──► trama.com.ar  (Vercel o Netlify: React compilado)
                 │
                 └─► api.trama.com.ar  (Render o Railway: Node + Express)
                          │
                          └─► MongoDB Atlas (cluster M0 gratuito)
```

## 1. Base de datos: MongoDB Atlas

1. Crear un proyecto y un cluster **M0** en [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. *Database Access*: crear un usuario con contraseña larga.
3. *Network Access*: permitir `0.0.0.0/0` (Render no tiene IP fija en el plan gratuito).
4. Copiar la cadena de conexión `mongodb+srv://...` y agregar el nombre de la base al final: `/trama`.

## 2. API: Render

1. *New → Web Service* y elegir el repositorio. **Root directory:** `server`.
2. Build: `npm install` · Start: `npm start` · Node 22.
3. Variables de entorno (las de `server/.env.example`):
   - `NODE_ENV=production`
   - `MONGODB_URI` (de Atlas) y `JWT_SECRET` (48 bytes aleatorios)
   - `CLIENT_URL=https://trama.com.ar` y `API_URL=https://api.trama.com.ar`
   - `PAYMENT_PROVIDER=mock` hasta tener credenciales de Mercado Pago
4. Health check: `/api/health`.
5. Cargar datos de demo una vez, desde tu máquina: `MONGODB_URI=<atlas> npm run seed -w server`.

También está `render.yaml` en la raíz para crearlo como *Blueprint*.

## 3. Front: Vercel

1. *Add New → Project*, elegir el repositorio. **Root directory:** `client`. Vercel detecta Vite.
2. Variable: `VITE_API_URL=https://api.trama.com.ar`.
3. `client/vercel.json` ya redirige todas las rutas a `index.html` (necesario para React Router).
   En Netlify, el equivalente es `client/public/_redirects`.

## 4. Dominio

1. Comprar el dominio (`.com.ar` en [nic.ar](https://nic.ar), `.com` en Namecheap, Cloudflare, etc.).
2. En Vercel: *Settings → Domains → Add* `trama.com.ar` y seguir los registros DNS que indica
   (registro `A` para el dominio raíz y `CNAME` para `www`).
3. En Render: *Settings → Custom Domains → Add* `api.trama.com.ar` y crear el `CNAME` que indica.
4. HTTPS se emite solo en ambos servicios.

> **Cookies entre dominios:** con front y API en el mismo dominio raíz (`trama.com.ar` y `api.trama.com.ar`)
> la cookie de sesión funciona sin problemas en todos los navegadores. Con dominios distintos
> (`*.vercel.app` y `*.onrender.com`) Safari puede bloquearla; usá el dominio propio para la demo final.

## 5. Pagos reales con Mercado Pago

1. Crear una aplicación en el [panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel/app).
2. Usar primero las **credenciales de prueba** y las tarjetas de prueba que publica Mercado Pago.
3. En Render: `PAYMENT_PROVIDER=mercadopago`, `MP_ACCESS_TOKEN=...`.
4. En el panel, configurar el webhook `https://api.trama.com.ar/api/payments/webhook/mercadopago`
   (evento *Pagos*) y copiar la clave secreta en `MP_WEBHOOK_SECRET`.
5. Probar una compra completa y verificar que el pedido pase a "Pago aprobado".

## Checklist antes de compartir el link

- [ ] `JWT_SECRET` único por entorno, nunca el de ejemplo
- [ ] `NODE_ENV=production` en la API
- [ ] Usuario admin con contraseña distinta a la del seed
- [ ] Lighthouse en móvil: accesibilidad y buenas prácticas por encima de 90
- [ ] Capturas y link en el README y en tu portfolio
