import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Alumnos', href: '/alumnos', icon: UserGroupIcon },
    { name: 'Materias', href: '/materias', icon: BookOpenIcon },
    { name: 'Boletas', href: '/boletas', icon: DocumentTextIcon },
    { name: 'Config', href: '/configuracion', icon: Cog6ToothIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900">Sistema de Boletas</h1>
              <p className="text-xs text-slate-500 -mt-1">Panel Administrativo</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Navigation - Icon Only */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`p-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <BellIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {(user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Cerrar Sesión"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
