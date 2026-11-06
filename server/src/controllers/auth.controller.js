import { z } from 'zod';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken, cookieOptions, TOKEN_COOKIE } from '../middleware/auth.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresá tu nombre.').max(80),
  email: z.string().trim().toLowerCase().email('Ingresá un email válido.'),
  password: z
    .string()
    .min(8, 'La contraseña necesita al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La contraseña necesita al menos una letra.')
    .regex(/\d/, 'La contraseña necesita al menos un número.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Ingresá un email válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});

export const addressSchema = z.object({
  street: z.string().trim().min(3, 'Ingresá calle y número.'),
  city: z.string().trim().min(2, 'Ingresá la ciudad.'),
  province: z.string().trim().min(2, 'Ingresá la provincia.'),
  zip: z.string().trim().min(4, 'Ingresá el código postal.'),
  phone: z.string().trim().optional(),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  address: addressSchema.optional(),
});

function sendSession(res, user, status = 200) {
  res.cookie(TOKEN_COOKIE, signToken(user), cookieOptions());
  res.status(status).json({ user });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    throw AppError.conflict('Ya hay una cuenta con ese email. Probá iniciar sesión.');
  }
  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();
  sendSession(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  // Mismo mensaje para email o contraseña incorrectos: no revela qué cuentas existen.
  if (!user || !(await user.comparePassword(password))) {
    throw AppError.unauthorized('Email o contraseña incorrectos.');
  }
  sendSession(res, user);
}

export function logout(_req, res) {
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user });
}
