import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  const refresh = async () => { try { const { data } = await api.get('/auth/me'); setUser(data.user); setProfile(data.profile); } catch { localStorage.removeItem('stichy_token'); setUser(null); setProfile(null); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);
  const login = async (credentials) => { const { data } = await api.post('/auth/login', credentials); localStorage.setItem('stichy_token', data.token); await refresh(); return data.user; };
  const register = async (details) => { const { data } = await api.post('/auth/register', details); localStorage.setItem('stichy_token', data.token); await refresh(); return data.user; };
  const logout = () => { localStorage.removeItem('stichy_token'); setUser(null); setProfile(null); };
  return <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
