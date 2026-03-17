import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import React from 'react';

// Mock the API
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
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

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.username : 'No User'}</div>
      <button onClick={() => login({ username: 'test', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => register({ username: 'new', email: 'new@test.com', password: 'pass' })}>Register</button>
    </div>
  );
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should show loading state initially', () => {
    renderWithAuth(<TestComponent />);
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should show not authenticated when no token', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderWithAuth(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('should login successfully', async () => {
    const { authApi } = await import('../services/api');
    
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    
    const mockTokenResponse = {
      access_token: 'test-token',
      token_type: 'bearer',
    };
    
    vi.mocked(authApi.login).mockResolvedValueOnce(mockTokenResponse);
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUser);
    
    renderWithAuth(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    screen.getByText('Login').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'test-token');
  });

  it('should logout successfully', async () => {
    const { authApi } = await import('../services/api');
    
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    
    localStorageMock.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUser);
    
    renderWithAuth(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    screen.getByText('Logout').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
  });

  it('should register successfully', async () => {
    const { authApi } = await import('../services/api');
    
    const mockUser = {
      id: 1,
      username: 'newuser',
      email: 'new@test.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    
    vi.mocked(authApi.register).mockResolvedValueOnce(mockUser);
    
    renderWithAuth(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    screen.getByText('Register').click();
    
    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        username: 'new',
        email: 'new@test.com',
        password: 'pass',
      });
    });
  });
});
