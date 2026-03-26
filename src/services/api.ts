import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface Alumno {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  codigo?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  estado_nacimiento?: string;
  nombre_representante?: string;
  telefono_representante?: string;
  correo_representante?: string;
  direccion_representante?: string;
  correo_estudiante?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  modalidad?: string;
}

export interface AlumnoCreate {
  cedula: string;
  nombre: string;
  apellido: string;
  codigo?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  estado_nacimiento?: string;
  nombre_representante?: string;
  telefono_representante?: string;
  correo_representante?: string;
  direccion_representante?: string;
  correo_estudiante?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  modalidad?: string;
}

export interface AlumnoUpdate {
  cedula?: string;
  nombre?: string;
  apellido?: string;
  codigo?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  estado_nacimiento?: string;
  nombre_representante?: string;
  telefono_representante?: string;
  correo_representante?: string;
  direccion_representante?: string;
  correo_estudiante?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  modalidad?: string;
}

export interface Seccion {
  id: number;
  grado: number;
  letra: string;
  modalidad?: string;
  anio_escolar?: string;
}

export interface SeccionCreate {
  grado: number;
  letra: string;
  modalidad?: string;
  anio_escolar?: string;
}

export interface SeccionUpdate {
  grado?: number;
  letra?: string;
  modalidad?: string;
  anio_escolar?: string;
}

export interface Materia {
  id: number;
  nombre: string;
  grado: number;
  es_numerica: boolean;
  modalidad?: string;
}

export interface MateriaCreate {
  nombre: string;
  grado: number;
  es_numerica: boolean;
  modalidad?: string;
}

export interface MateriaUpdate {
  nombre?: string;
  grado?: number;
  es_numerica?: boolean;
  modalidad?: string;
}

export interface Calificacion {
  id: number;
  materia_id: number;
  lapso_1_def?: number;
  lapso_2_def?: number;
  lapso_3_def?: number;
  def_final?: number;
  literal?: string;
  materia: Materia;
}

export interface CalificacionCreate {
  alumno_id: number;
  materia_id: number;
  anio_escolar: string;
  lapso_1_def?: number;
  lapso_2_def?: number;
  lapso_3_def?: number;
  def_final?: number;
  literal?: string;
}

export interface CalificacionUpdate {
  lapso_1_def?: number;
  lapso_2_def?: number;
  lapso_3_def?: number;
  def_final?: number;
  literal?: string;
}

export interface LapsoNotaInput {
  alumno_id: number;
  materia_id: number;
  lapso: number;
  nota: number;
  anio_escolar?: string;
  literal?: string;
}

export interface Boleta {
  id: number;
  alumno_id: number;
  anio_escolar?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  tipo_evaluacion?: string;
  observaciones?: string;
  hasta_lapso?: number;
  profesor?: string;
  nombre_plantel?: string;
  direccion_plantel?: string;
  created_at?: string;
  alumno: Alumno;
  calificaciones: Calificacion[];
  media_lapso_1?: number;
  media_lapso_2?: number;
  media_lapso_3?: number;
  medias_globales?: number;
  media_seccion?: number;
}

export interface BoletaCreate {
  alumno_id: number;
  anio_escolar?: string;
  grado?: number;
  seccion?: string;
  modalidad?: string;
  numero_lista?: number;
  inasistencias_lapso_1?: number;
  inasistencias_lapso_2?: number;
  inasistencias_lapso_3?: number;
  tipo_evaluacion?: string;
  observaciones?: string;
  hasta_lapso?: number;
  profesor?: string;
  nombre_plantel?: string;
  direccion_plantel?: string;
}

export interface BoletaUpdate {
  anio_escolar?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  inasistencias?: number;
  tipo_evaluacion?: string;
  observaciones?: string;
  profesor?: string;
  nombre_plantel?: string;
  direccion_plantel?: string;
}

export interface BoletaList {
  id: number;
  alumno_id: number;
  anio_escolar?: string;
  grado?: number;
  seccion?: string;
  numero_lista?: number;
  tipo_evaluacion?: string;
  observaciones?: string;
  hasta_lapso?: number;
  profesor?: string;
  nombre_plantel?: string;
  direccion_plantel?: string;
  created_at?: string;
  media_lapso_1?: number;
  media_lapso_2?: number;
  media_lapso_3?: number;
  medias_globales?: number;
  media_seccion?: number;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string; recovery_token?: string }> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export const alumnoApi = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Alumno[]> => {
    const response = await api.get(`/alumnos?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: number): Promise<Alumno> => {
    const response = await api.get(`/alumnos/${id}`);
    return response.data;
  },

  getByCedula: async (cedula: string): Promise<Alumno> => {
    const response = await api.get(`/alumnos/cedula/${cedula}`);
    return response.data;
  },

  create: async (data: AlumnoCreate): Promise<Alumno> => {
    const response = await api.post('/alumnos', data);
    return response.data;
  },

  update: async (id: number, data: AlumnoUpdate): Promise<Alumno> => {
    const response = await api.put(`/alumnos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/alumnos/${id}`);
  },
};

export const materiaApi = {
  getAll: async (skip: number = 0, limit: number = 100, grado?: number, modalidad?: string): Promise<Materia[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (grado !== undefined) {
      params.append('grado', grado.toString());
    }
    if (modalidad) {
      params.append('modalidad', modalidad);
    }
    const response = await api.get(`/materias?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Materia> => {
    const response = await api.get(`/materias/${id}`);
    return response.data;
  },

  create: async (data: MateriaCreate): Promise<Materia> => {
    const response = await api.post('/materias', data);
    return response.data;
  },

  update: async (id: number, data: MateriaUpdate): Promise<Materia> => {
    const response = await api.put(`/materias/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/materias/${id}`);
  },
};

export const boletaApi = {
  getAll: async (skip: number = 0, limit: number = 100, alumnoId?: number, anioEscolar?: string, tipoEvaluacion?: string): Promise<BoletaList[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (alumnoId !== undefined) params.append('alumno_id', alumnoId.toString());
    if (anioEscolar) params.append('anio_escolar', anioEscolar);
    if (tipoEvaluacion) params.append('tipo_evaluacion', tipoEvaluacion);
    
    const response = await api.get(`/boletas?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Boleta> => {
    const response = await api.get(`/boletas/${id}`);
    return response.data;
  },

  create: async (data: BoletaCreate): Promise<Boleta> => {
    const response = await api.post('/boletas', data);
    return response.data;
  },

  update: async (id: number, data: BoletaUpdate): Promise<Boleta> => {
    const response = await api.put(`/boletas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/boletas/${id}`);
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    const response = await api.get(`/boletas/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const calificacionApi = {
  registrarNota: async (data: LapsoNotaInput): Promise<Calificacion> => {
    const response = await api.post('/calificaciones', data);
    return response.data;
  },

  getByAlumno: async (alumnoId: number, anioEscolar?: string): Promise<Calificacion[]> => {
    const url = anioEscolar ? `/calificaciones/alumno/${alumnoId}?anio_escolar=${anioEscolar}` : `/calificaciones/alumno/${alumnoId}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<Calificacion> => {
    const response = await api.get(`/calificaciones/${id}`);
    return response.data;
  },

  update: async (id: number, data: CalificacionUpdate): Promise<Calificacion> => {
    const response = await api.put(`/calificaciones/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/calificaciones/${id}`);
  },
};

export interface DashboardStats {
  total_alumnos: number;
  total_materias: number;
  total_boletas: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export interface Configuracion {
  id: number;
  nombre_plantel: string;
  direccion_plantel: string;
  anio_escolar_actual: string;
  profesor_guia_default: string;
  updated_at: string;
}

export interface ConfiguracionUpdate {
  nombre_plantel?: string;
  direccion_plantel?: string;
  anio_escolar_actual?: string;
  profesor_guia_default?: string;
}

export const configuracionApi = {
  get: async (): Promise<Configuracion> => {
    const response = await api.get('/configuracion');
    return response.data;
  },

  update: async (data: ConfiguracionUpdate): Promise<Configuracion> => {
    const response = await api.put('/configuracion', data);
    return response.data;
  },
};

export const seccionApi = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Seccion[]> => {
    const response = await api.get(`/secciones?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: number): Promise<Seccion> => {
    const response = await api.get(`/secciones/${id}`);
    return response.data;
  },

  create: async (data: SeccionCreate): Promise<Seccion> => {
    const response = await api.post('/secciones', data);
    return response.data;
  },

  update: async (id: number, data: SeccionUpdate): Promise<Seccion> => {
    const response = await api.put(`/secciones/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/secciones/${id}`);
  },
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Clear user state by redirecting to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
