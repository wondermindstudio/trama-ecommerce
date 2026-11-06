import jwt from 'jsonwebtoken';
import { env, isProd } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const TOKEN_COOKIE = 'token';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// Cookie httpOnly: el token no es accesible desde JavaScript (mitiga XSS).
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    // Front y API en dominios distintos en producción → SameSite=None + Secure.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function readToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[TOKEN_COOKIE];
}

export async function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) throw AppError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw AppError.unauthorized('Tu sesión venció. Iniciá sesión de nuevo.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw AppError.unauthorized();
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw AppError.forbidden();
    next();
  };
}
