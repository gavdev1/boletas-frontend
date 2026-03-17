import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import React from 'react';

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Sistema de Boletas')).toBeInTheDocument();
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
  });

  it('should submit form with credentials', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText('Ingresa tu usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByText('Iniciar Sesión');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('should show error message on login failure', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    mockLogin.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } },
    });

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText('Ingresa tu usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByText('Iniciar Sesión');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    mockLogin.mockImplementation(() => new Promise(() => {}));

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText('Ingresa tu usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByText('Iniciar Sesión');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    });
  });

  it('should have link to register page', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    const registerLink = screen.getByText('Regístrate aquí');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('should have link to forgot password page', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(<Login />);

    const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });
});
