import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('buzzhive_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('buzzhive_token');
        localStorage.removeItem('buzzhive_user');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('buzzhive_token', res.data.token);
    localStorage.setItem('buzzhive_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, username, email, password) {
    const res = await api.post('/auth/register', { name, username, email, password });
    localStorage.setItem('buzzhive_token', res.data.token);
    localStorage.setItem('buzzhive_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('buzzhive_token');
    localStorage.removeItem('buzzhive_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
