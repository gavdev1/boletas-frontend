import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
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

describe('Navbar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar with user info', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Sistema de Boletas')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('should render navigation links', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alumnos')).toBeInTheDocument();
    expect(screen.getByText('Materias')).toBeInTheDocument();
    expect(screen.getByText('Boletas')).toBeInTheDocument();
    expect(screen.getByText('Config')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(<Navbar />);

    const logoutButton = screen.getByTitle('Cerrar Sesión');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
