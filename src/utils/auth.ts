import { Usuario } from '../types';

// Claves para localStorage
const TOKEN_KEY = 'lineas_profundizacion_token';
const USER_KEY = 'lineas_profundizacion_usuario';

export const guardarToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error guardando token:', error);
  }
};

export const obtenerToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

export const eliminarToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error eliminando token:', error);
  }
};

export const guardarUsuario = (usuario: Usuario): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  } catch (error) {
    console.error('Error guardando usuario:', error);
  }
};

export const obtenerUsuario = (): Usuario | null => {
  try {
    const usuarioStr = localStorage.getItem(USER_KEY);
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

export const eliminarUsuario = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
  }
};

export const estaAutenticado = (): boolean => {
  return !!obtenerToken();
};

export const esAdmin = (): boolean => {
  const usuario = obtenerUsuario();
  return usuario?.rol === 'admin';
};

export const cerrarSesion = (): void => {
  eliminarToken();
  eliminarUsuario();
};

// Validar expiración del token (básico)
export const tokenEsValido = (): boolean => {
  const token = obtenerToken();
  if (!token) return false;

  try {
    // Decodificar el token JWT (parte del payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiraEn = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() < expiraEn;
  } catch (error) {
    console.error('Error validando token:', error);
    return false;
  }
};