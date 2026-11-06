import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // La sesión vive en una cookie httpOnly: preguntamos al servidor quién somos.
  useEffect(() => {
    api('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { user } = await api('/auth/login', { method: 'POST', body: credentials });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { user } = await api('/auth/register', { method: 'POST', body: data });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateMe = useCallback(async (data) => {
    const { user } = await api('/auth/me', { method: 'PATCH', body: data });
    setUser(user);
    return user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateMe }),
    [user, loading, login, register, logout, updateMe],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
