# Stack tecnológico

## Qué se usa hoy (datos, no opiniones)

Según la [encuesta de desarrolladores de Stack Overflow 2026](https://survey.stackoverflow.co/2026/technology):

| Lenguaje   | Uso   |   | Base de datos | Uso   |
|------------|-------|---|---------------|-------|
| JavaScript | 62 %  |   | PostgreSQL    | 58 %  |
| SQL        | 58 %  |   | SQLite        | 42 %  |
| Python     | 58 %  |   | MySQL         | 35 %  |
| TypeScript | 44 %  |   | Redis         | 28 %  |
|            |       |   | MongoDB       | 19 %  |

Y en frameworks y herramientas web ([edición 2025](https://survey.stackoverflow.co/2025/technology)):
Node.js 49 %, React 45 %, Next.js 21 %, Express 20 %, Angular 18 %, Vue 18 %; Docker 71 %, AWS 43 %.

**Conclusión práctica:** JavaScript/TypeScript de punta a punta (React + Node.js) es la combinación con más
demanda laboral. En bases de datos, PostgreSQL es la más usada; MongoDB sigue siendo muy común en
stacks MERN y en bootcamps porque su modelo de documentos encaja natural con JSON.

## Qué usa este proyecto y por qué

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Front | **React 19 + Vite** | El framework de UI más pedido; Vite compila en milisegundos. |
| Ruteo | **React Router 7** | Rutas anidadas, rutas protegidas y carga diferida por página. |
| Estado | **Zustand** (carrito) + **Context** (sesión) | Simple, sin boilerplate; el carrito persiste en `localStorage`. |
| Estilos | **CSS con custom properties** | Un archivo de tokens por marca. Sin dependencias, fácil de leer. |
| Back | **Node.js 22 + Express 5** | Express 5 maneja errores de funciones `async` sin wrappers. |
| Validación | **Zod** | Un esquema valida el body y genera los mensajes de error por campo. |
| Base de datos | **MongoDB + Mongoose 8** | Catálogos con atributos distintos por rubro (talle, molienda, specs) sin migraciones. |
| Auth | **JWT en cookie httpOnly + bcrypt** | El token no es legible desde JavaScript (mitiga XSS). |
| Pagos | **Mercado Pago Checkout Pro** + modo demo | Cuotas, tarjetas, efectivo y transferencia; los datos de tarjeta nunca tocan nuestro servidor. |
| Seguridad | **Helmet, CORS, rate limit** | Headers seguros, origen permitido explícito y freno a fuerza bruta en login. |
| Tests | **node:test** (nativo) | Cero dependencias para testear el motor de promociones. |
| CI | **GitHub Actions** | Lint, tests y build en cada push y pull request. |

## Próximos pasos recomendados para seguir aprendiendo

1. **Migrar a TypeScript** (44 % de uso y creciendo): empezar por `pricing.js`.
2. **Probar PostgreSQL + Prisma** en una de las tres tiendas para comparar modelos relacional y de documentos.
3. **Tests de integración** de la API con `supertest` y de componentes con `vitest` + Testing Library.
4. **Docker** para levantar API + Mongo con un comando (ya hay un `docker-compose.yml` para Mongo).
