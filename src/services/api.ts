import axios from 'axios';
import { 
  LineaProfundizacion, 
  AuthResponse, 
  ApiResponse, 
  Usuario,
  FiltrosLineas,
  Estadisticas 
} from '../types';
import { obtenerToken, cerrarSesion } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = obtenerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject({
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR'
      });
    }

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.warn('Token inválido o expirado, cerrando sesión...');
      cerrarSesion();
      // Redirigir al login si estamos en el cliente
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Manejar otros errores HTTP
    const message = error.response?.data?.message || 'Error del servidor';
    const status = error.response?.status;

    return Promise.reject({
      message,
      status,
      data: error.response?.data,
      code: error.code
    });
  }
);

// API de Autenticación
export const authAPI = {
  login: (email: string, password: string) => 
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  registro: (nombre: string, email: string, password: string, rol?: string) =>
    api.post<AuthResponse>('/auth/registro', { nombre, email, password, rol }),
  
  perfil: () => 
    api.get<ApiResponse<Usuario>>('/auth/perfil'),
  
  cambiarPassword: (passwordActual: string, nuevaPassword: string) =>
    api.put<ApiResponse<void>>('/auth/cambiar-password', { passwordActual, nuevaPassword })
};

// API de Líneas de Profundización
export const lineasAPI = {
  obtenerTodas: (filtros?: FiltrosLineas) => 
    api.get<ApiResponse<LineaProfundizacion[]>>('/lineas', { params: filtros }),
  
  obtenerPorId: (id: string) => 
    api.get<ApiResponse<LineaProfundizacion>>(`/lineas/${id}`),
  
  crear: (linea: Omit<LineaProfundizacion, '_id'>) => 
    api.post<ApiResponse<LineaProfundizacion>>('/lineas', linea),
  
  actualizar: (id: string, linea: Partial<LineaProfundizacion>) => 
    api.put<ApiResponse<LineaProfundizacion>>(`/lineas/${id}`, linea),
  
  eliminar: (id: string) => 
    api.delete<ApiResponse<void>>(`/lineas/${id}`),
  
  obtenerEstadisticas: () =>
    api.get<ApiResponse<Estadisticas>>('/lineas/estadisticas'),
  
  buscar: (termino: string, limite: number = 10) =>
    api.get<ApiResponse<LineaProfundizacion[]>>('/lineas/buscar', {
      params: { q: termino, limite }
    })
};

// Health check
export const healthCheck = () => 
  api.get('/health');

export default api;