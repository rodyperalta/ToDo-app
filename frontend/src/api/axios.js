import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_URL, // Ej: http://localhost:5000/api
});


// Interceptor para añadir el token a las peticiones
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores de autenticación (401)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Podríamos redirigir a login, pero lo haremos en el componente
    }
    return Promise.reject(error);
  },
);

export default instance;
