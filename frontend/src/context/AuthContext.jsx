import { useState, useEffect } from 'react';
import {AuthContext} from '../hooks/useAuth'
import axios from '../api/axios'; // Lo crearemos después

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si hay token en localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      // Configurar el token por defecto en Axios (lo haremos en el interceptor)
    }
    setLoading(false);
  }, []);

  // Función para registrar
  const register = async (email, password) => {
    try {
      const res = await axios.post('/auth/register', { email, password });
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      setUser(usuario);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.mensaje || 'Error en el registro' };
    }
  };

  // Función para login
  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      setUser(usuario);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.mensaje || 'Error en el login' };
    }
  };

  // Función para logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


