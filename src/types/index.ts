export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'admin';
  ultimoLogin?: string;
  createdAt?: string;
}

export interface LineaProfundizacion {
  _id?: string;
  nombre: string;
  descripcion: string;
  coordinador: string;
  emailCoordinador: string;
  areaConocimiento: string;
  creditosRequeridos: number;
  materias: string[];
  estado: 'activa' | 'inactiva';
  fechaCreacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: Usuario;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  paginacion?: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}

export interface FiltrosLineas {
  area?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
  ordenar?: string;
}

export interface Estadisticas {
  totalLineas: number;
  lineasActivas: number;
  lineasInactivas: number;
  lineasPorArea: Record<string, number>;
  creditosPromedio: number;
}