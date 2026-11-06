import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { isProd } from '../config/env.js';

export function notFound(req, _res, next) {
  next(AppError.notFound(`La ruta ${req.method} ${req.originalUrl} no existe.`));
}

// Express 5 envía acá también los errores de funciones async.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Revisá los datos enviados.',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Identificador inválido.' });
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo';
    return res.status(409).json({ message: `Ya existe un registro con ese ${field}.` });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({
    message: 'Error interno del servidor.',
    ...(isProd ? {} : { stack: err.stack }),
  });
}
