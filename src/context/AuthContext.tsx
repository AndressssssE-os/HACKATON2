import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { authAPI } from '../services/api';
import { 
  obtenerToken, 
  guardarToken, 
  eliminarToken, 
  obtenerUsuario, 
  guardarUsuario, 
  eliminarUsuario,
  tokenEsValido 
} from '../utils/auth';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  esAdmin: boolean;
  cargando: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar la app
    const verificarAutenticacion = async () => {
      const tokenStorage = obtenerToken();
      const usuarioStorage = obtenerUsuario();

      if (tokenStorage && usuarioStorage && tokenEsValido()) {
        setToken(tokenStorage);
        setUsuario(usuarioStorage);
        
        // Verificar con el servidor que el token sigue siendo válido
        try {
          await authAPI.perfil();
        } catch (error) {
          // Token inválido en el servidor, cerrar sesión
          console.error('Token inválido en servidor:', error);
          logout();
        }
      } else {
        // Token inválido o expirado
        if (tokenStorage || usuarioStorage) {
          logout();
        }
      }

      setCargando(false);
    };

    verificarAutenticacion();
  }, []);

  const login = (nuevoToken: string, nuevoUsuario: Usuario) => {
    guardarToken(nuevoToken);
    guardarUsuario(nuevoUsuario);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const logout = () => {
    eliminarToken();
    eliminarUsuario();
    setToken(null);
    setUsuario(null);
  };

  const actualizarUsuario = (nuevoUsuario: Usuario) => {
    guardarUsuario(nuevoUsuario);
    setUsuario(nuevoUsuario);
  };

  const value: AuthContextType = {
    usuario,
    token,
    estaAutenticado: !!token && !!usuario,
    esAdmin: usuario?.rol === 'admin',
    cargando,
    login,
    logout,
    actualizarUsuario
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};