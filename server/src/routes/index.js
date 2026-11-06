import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as auth from '../controllers/auth.controller.js';
import * as products from '../controllers/products.controller.js';
import * as cart from '../controllers/cart.controller.js';
import * as orders from '../controllers/orders.controller.js';
import * as promotions from '../controllers/promotions.controller.js';
import * as payments from '../controllers/payments.controller.js';
import { cartInputSchema } from '../services/cart.service.js';

export const router = Router();
const admin = [requireAuth, requireRole('admin')];

// Limita intentos de login/registro para frenar fuerza bruta.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

router.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Autenticación
router.post('/auth/register', authLimiter, validate(auth.registerSchema), auth.register);
router.post('/auth/login', authLimiter, validate(auth.loginSchema), auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);
router.patch('/auth/me', requireAuth, validate(auth.updateMeSchema), auth.updateMe);

// Catálogo
router.get('/products', validate(products.listQuerySchema, 'query'), products.list);
router.get('/products/categories', products.categories);
router.get('/products/:slug', products.getBySlug);
router.post('/products', ...admin, validate(products.productSchema), products.create);
router.patch('/products/:id', ...admin, validate(products.productSchema.partial()), products.update);
router.delete('/products/:id', ...admin, products.remove);

// Carrito y configuración de la tienda
router.get('/store/settings', cart.settings);
router.post('/cart/quote', validate(cartInputSchema), cart.quote);

// Promociones
router.get('/promotions/active', promotions.listActive);
router.get('/promotions', ...admin, promotions.listAll);
router.post('/promotions', ...admin, validate(promotions.promotionSchema), promotions.create);
router.patch('/promotions/:id', ...admin, validate(promotions.promotionSchema.partial()), promotions.update);
router.delete('/promotions/:id', ...admin, promotions.remove);

// Pedidos
router.post('/orders', requireAuth, validate(orders.createOrderSchema), orders.create);
router.get('/orders/mine', requireAuth, orders.mine);
router.get('/orders', ...admin, orders.listAll);
router.get('/orders/:id', requireAuth, orders.getOne);
router.patch('/orders/:id/status', ...admin, validate(orders.statusSchema), orders.updateStatus);

// Pagos
router.post('/payments/webhook/mercadopago', payments.mercadoPagoWebhook);
