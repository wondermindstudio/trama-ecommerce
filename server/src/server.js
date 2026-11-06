import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

await connectDB();
const server = createApp().listen(env.PORT, () => {
  console.log(`API de Trama escuchando en http://localhost:${env.PORT}/api`);
});

// Cierre ordenado: el hosting manda SIGTERM antes de reiniciar.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
}
