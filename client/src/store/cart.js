import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// La clave combina producto y opciones: el mismo producto en otro talle es otra línea.
export const lineKey = (slug, options = {}) =>
  `${slug}::${Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|')}`;

export const useCart = create()(
  persist(
    (set, get) => ({
      items: [], // { key, slug, name, price, qty, options, art, images }
      couponCode: '',
      lastAdded: null,

      add(product, options = {}, qty = 1) {
        const key = lineKey(product.slug, options);
        const existing = get().items.find((i) => i.key === key);
        const max = product.stock ?? 20;
        set({
          lastAdded: { key, name: product.name, at: Date.now() },
          items: existing
            ? get().items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, max, 20) } : i))
            : [
                ...get().items,
                {
                  key,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  qty: Math.min(qty, max, 20),
                  options,
                  art: product.art,
                  images: product.images,
                },
              ],
        });
      },

      setQty(key, qty) {
        set({
          items:
            qty <= 0
              ? get().items.filter((i) => i.key !== key)
              : get().items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 20) } : i)),
        });
      },

      remove(key) {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      setCoupon(couponCode) {
        set({ couponCode });
      },

      clear() {
        set({ items: [], couponCode: '' });
      },

      // Formato que espera POST /api/cart/quote y POST /api/orders
      toPayload() {
        return {
          items: get().items.map(({ slug, qty, options }) => ({ slug, qty, options })),
          couponCode: get().couponCode || undefined,
        };
      },
    }),
    {
      name: 'trama-cart',
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
    },
  ),
);

export const selectCount = (s) => s.items.reduce((sum, i) => sum + i.qty, 0);
