// Error de negocio con código HTTP. El middleware de errores lo devuelve tal cual.
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'Necesitás iniciar sesión.') {
    return new AppError(401, message);
  }

  static forbidden(message = 'No tenés permiso para esta acción.') {
    return new AppError(403, message);
  }

  static notFound(message = 'No encontramos lo que buscabas.') {
    return new AppError(404, message);
  }

  static conflict(message) {
    return new AppError(409, message);
  }
}
