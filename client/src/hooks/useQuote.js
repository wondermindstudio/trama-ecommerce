import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useCart } from '../store/cart.js';

/**
 * Pide al backend la cotización del carrito cada vez que cambia algo
 * (productos, cupón, medio de pago, cuotas). Con debounce de 250 ms.
 */
export function useQuote({ paymentMethod, installments } = {}) {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const [state, setState] = useState({ quote: null, error: null, loading: true });

  const payload = JSON.stringify({
    items: items.map(({ slug, qty, options }) => ({ slug, qty, options })),
    couponCode: couponCode || undefined,
    paymentMethod,
    installments,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));
    const t = setTimeout(() => {
      api('/cart/quote', { method: 'POST', body: JSON.parse(payload), signal: controller.signal })
        .then((quote) => setState({ quote, error: null, loading: false }))
        .catch((error) => {
          if (error.name !== 'AbortError') setState({ quote: null, error, loading: false });
        });
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [payload]);

  return state;
}
