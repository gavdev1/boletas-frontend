import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  api,
  authApi,
  alumnoApi,
  materiaApi,
  boletaApi,
  calificacionApi,
  dashboardApi,
  configuracionApi,
} from '../services/api';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AlumnoCreate,
  AlumnoUpdate,
  MateriaCreate,
  MateriaUpdate,
  BoletaCreate,
  CalificacionCreate,
  ConfiguracionUpdate,
} from '../services/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login endpoint', async () => {
    const mockData: LoginRequest = {
      username: 'testuser',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        access_token: 'token123',
        token_type: 'bearer',
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await authApi.login(mockData);

    expect(api.post).toHaveBeenCalledWith('/auth/login', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should call register endpoint', async () => {
    const mockData: RegisterRequest = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        id: 1,
        username: 'newuser',
        email: 'new@example.com',
        is_active: true,
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await authApi.register(mockData);

    expect(api.post).toHaveBeenCalledWith('/auth/register', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should call forgot password endpoint', async () => {
    const mockData: ForgotPasswordRequest = {
      email: 'test@example.com',
    };

    const mockResponse = {
      data: {
        message: 'Recovery email sent',
        recovery_token: 'token123',
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await authApi.forgotPassword(mockData);

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should call reset password endpoint', async () => {
    const mockData: ResetPasswordRequest = {
      token: 'token123',
      new_password: 'newpassword123',
    };

    const mockResponse = {
      data: {
        message: 'Password reset successful',
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await authApi.resetPassword(mockData);

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should get current user', async () => {
    const mockResponse = {
      data: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await authApi.getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockResponse.data);
  });
});

describe('alumnoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all alumnos', async () => {
    const mockResponse = {
      data: [
        { id: 1, nombre: 'Juan', apellido: 'Perez', cedula: '12345678' },
        { id: 2, nombre: 'Maria', apellido: 'Garcia', cedula: '87654321' },
      ],
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.getAll();

    expect(api.get).toHaveBeenCalledWith('/alumnos?skip=0&limit=100');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get alumno by id', async () => {
    const mockResponse = {
      data: { id: 1, nombre: 'Juan', apellido: 'Perez', cedula: '12345678' },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.getById(1);

    expect(api.get).toHaveBeenCalledWith('/alumnos/1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get alumno by cedula', async () => {
    const mockResponse = {
      data: { id: 1, nombre: 'Juan', apellido: 'Perez', cedula: '12345678' },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.getByCedula('12345678');

    expect(api.get).toHaveBeenCalledWith('/alumnos/cedula/12345678');
    expect(result).toEqual(mockResponse.data);
  });

  it('should create alumno', async () => {
    const mockData: AlumnoCreate = {
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '12345678',
    };

    const mockResponse = {
      data: { id: 1, ...mockData },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.create(mockData);

    expect(api.post).toHaveBeenCalledWith('/alumnos', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should update alumno', async () => {
    const mockData: AlumnoUpdate = {
      nombre: 'Juan Carlos',
    };

    const mockResponse = {
      data: { id: 1, nombre: 'Juan Carlos', apellido: 'Perez', cedula: '12345678' },
    };

    vi.spyOn(api, 'put').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.update(1, mockData);

    expect(api.put).toHaveBeenCalledWith('/alumnos/1', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete alumno', async () => {
    const mockResponse = {
      data: { message: 'Alumno deleted successfully' },
    };

    vi.spyOn(api, 'delete').mockResolvedValueOnce(mockResponse);

    const result = await alumnoApi.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/alumnos/1');
    expect(result).toBeUndefined();
  });
});

describe('materiaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all materias', async () => {
    const mockResponse = {
      data: [
        { id: 1, nombre: 'Matemática', grado: 1, es_numerica: true },
        { id: 2, nombre: 'Lengua', grado: 1, es_numerica: false },
      ],
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await materiaApi.getAll();

    expect(api.get).toHaveBeenCalledWith('/materias?skip=0&limit=100');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get materias by grado', async () => {
    const mockResponse = {
      data: [{ id: 1, nombre: 'Matemática', grado: 1, es_numerica: true }],
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await materiaApi.getAll(0, 100, 1);

    expect(api.get).toHaveBeenCalledWith('/materias?skip=0&limit=100&grado=1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should create materia', async () => {
    const mockData: MateriaCreate = {
      nombre: 'Historia',
      grado: 2,
      es_numerica: false,
    };

    const mockResponse = {
      data: { id: 3, ...mockData },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await materiaApi.create(mockData);

    expect(api.post).toHaveBeenCalledWith('/materias', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should update materia', async () => {
    const mockData: MateriaUpdate = {
      nombre: 'Historia Universal',
    };

    const mockResponse = {
      data: { id: 3, nombre: 'Historia Universal', grado: 2, es_numerica: false },
    };

    vi.spyOn(api, 'put').mockResolvedValueOnce(mockResponse);

    const result = await materiaApi.update(3, mockData);

    expect(api.put).toHaveBeenCalledWith('/materias/3', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete materia', async () => {
    const mockResponse = {
      data: { message: 'Materia deleted successfully' },
    };

    vi.spyOn(api, 'delete').mockResolvedValueOnce(mockResponse);

    const result = await materiaApi.delete(3);

    expect(api.delete).toHaveBeenCalledWith('/materias/3');
    expect(result).toBeUndefined();
  });
});

describe('boletaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all boletas', async () => {
    const mockResponse = {
      data: [
        { id: 1, alumno_id: 1, anio_escolar: '2024-2025', tipo_evaluacion: 'Final' },
      ],
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await boletaApi.getAll();

    expect(api.get).toHaveBeenCalledWith('/boletas?skip=0&limit=100');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get boleta by id', async () => {
    const mockResponse = {
      data: { id: 1, alumno_id: 1, anio_escolar: '2024-2025', tipo_evaluacion: 'Final' },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await boletaApi.getById(1);

    expect(api.get).toHaveBeenCalledWith('/boletas/1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should create boleta', async () => {
    const mockData: BoletaCreate = {
      alumno_id: 1,
      anio_escolar: '2024-2025',
      grado: 1,
      seccion: 'A',
      tipo_evaluacion: 'Final',
      hasta_lapso: 3,
    };

    const mockResponse = {
      data: { id: 1, ...mockData },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await boletaApi.create(mockData);

    expect(api.post).toHaveBeenCalledWith('/boletas', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete boleta', async () => {
    const mockResponse = {
      data: { message: 'Boleta deleted successfully' },
    };

    vi.spyOn(api, 'delete').mockResolvedValueOnce(mockResponse);

    const result = await boletaApi.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/boletas/1');
    expect(result).toBeUndefined();
  });
});

describe('calificacionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get calificaciones by alumno', async () => {
    const mockResponse = {
      data: [
        { id: 1, alumno_id: 1, materia_id: 1, lapso_1_def: 18 },
      ],
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await calificacionApi.getByAlumno(1, '2024-2025');

    expect(api.get).toHaveBeenCalledWith('/calificaciones/alumno/1?anio_escolar=2024-2025');
    expect(result).toEqual(mockResponse.data);
  });

  it('should registrar nota', async () => {
    const mockData: CalificacionCreate = {
      alumno_id: 1,
      materia_id: 1,
      anio_escolar: '2024-2025',
      lapso_1_def: 18,
    };

    const mockResponse = {
      data: { id: 1, ...mockData },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await calificacionApi.registrarNota(mockData);

    expect(api.post).toHaveBeenCalledWith('/calificaciones', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should update calificacion', async () => {
    const mockData = { lapso_1_def: 20 };

    const mockResponse = {
      data: { id: 1, ...mockData },
    };

    vi.spyOn(api, 'put').mockResolvedValueOnce(mockResponse);

    const result = await calificacionApi.update(1, mockData);

    expect(api.put).toHaveBeenCalledWith('/calificaciones/1', mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete calificacion', async () => {
    vi.spyOn(api, 'delete').mockResolvedValueOnce({} as any);

    await calificacionApi.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/calificaciones/1');
  });

  it('should registrar nota', async () => {
    const mockData = {
      alumno_id: 1,
      materia_id: 1,
      lapso: 1,
      nota: 18,
      anio_escolar: '2024-2025',
    };

    const mockResponse = {
      data: { id: 1, ...mockData },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

    const result = await calificacionApi.registrarNota(mockData);

    expect(api.post).toHaveBeenCalledWith('/calificaciones', mockData);
    expect(result).toEqual(mockResponse.data);
  });
});

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get dashboard stats', async () => {
    const mockResponse = {
      data: {
        total_alumnos: 50,
        total_materias: 12,
        total_boletas: 100,
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await dashboardApi.getStats();

    expect(api.get).toHaveBeenCalledWith('/dashboard/stats');
    expect(result).toEqual(mockResponse.data);
  });
});

describe('configuracionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get configuracion', async () => {
    const mockResponse = {
      data: {
        id: 1,
        nombre_plantel: 'U.E. Colegio Simón Bolívar',
        direccion_plantel: 'Calle Principal #45',
        anio_escolar_actual: '2024-2025',
        profesor_guia_default: 'Lic. Antonio Machado',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

    const result = await configuracionApi.get();

    expect(api.get).toHaveBeenCalledWith('/configuracion');
    expect(result).toEqual(mockResponse.data);
  });

  it('should update configuracion', async () => {
    const mockData: ConfiguracionUpdate = {
      nombre_plantel: 'Nuevo Nombre',
      anio_escolar_actual: '2025-2026',
    };

    const mockResponse = {
      data: {
        id: 1,
        nombre_plantel: 'Nuevo Nombre',
        direccion_plantel: 'Calle Principal #45',
        anio_escolar_actual: '2025-2026',
        profesor_guia_default: 'Lic. Antonio Machado',
        updated_at: '2024-01-02T00:00:00Z',
      },
    };

    vi.spyOn(api, 'put').mockResolvedValueOnce(mockResponse);

    const result = await configuracionApi.update(mockData);

    expect(api.put).toHaveBeenCalledWith('/configuracion', mockData);
    expect(result).toEqual(mockResponse.data);
  });
});
