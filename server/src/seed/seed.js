import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Promotion } from '../models/Promotion.js';
import { User } from '../models/User.js';
import { products, promotions } from './data.js';

// Carga datos de demo. Borra productos y promociones existentes: usar solo en desarrollo.
await connectDB();

await Promise.all([Product.deleteMany({}), Promotion.deleteMany({})]);
await Product.insertMany(products);
await Promotion.insertMany(promotions);

const adminEmail = 'admin@trama.dev';
let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = new User({ name: 'Admin Trama', email: adminEmail, role: 'admin' });
  await admin.setPassword(process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!');
  await admin.save();
}

console.log(`${products.length} productos y ${promotions.length} promociones cargados.`);
console.log(`Admin: ${adminEmail}`);
await disconnectDB();
