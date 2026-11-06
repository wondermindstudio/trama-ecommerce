// Valida body o query con un esquema de Zod.
// El body validado reemplaza a req.body; la query validada queda en req.validatedQuery
// (en Express 5 req.query es de solo lectura).
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const data = schema.parse(source === 'query' ? req.query : req.body);
    if (source === 'query') req.validatedQuery = data;
    else req.body = data;
    next();
  };
