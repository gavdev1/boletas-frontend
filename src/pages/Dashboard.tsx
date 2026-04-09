import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, type DashboardStats } from '../services/api';
import Navbar from '../components/Navbar';
import {
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statsCards = [
    { name: 'Total Alumnos', value: stats?.total_alumnos?.total ?? 0, icon: UserGroupIcon, color: 'bg-blue-500', href: '/alumnos' },
    { name: 'Materias', value: stats?.total_materias ?? 0, icon: BookOpenIcon, color: 'bg-purple-500', href: '/materias' },
    { name: 'Boletas Generadas', value: stats?.total_boletas ?? 0, icon: DocumentTextIcon, color: 'bg-orange-500', href: '/boletas' },
  ];

  const quickActions = [
    {
      title: 'Gestión de Alumnos',
      description: 'Administrar estudiantes, registrar nuevos y editar información.',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
      href: '/alumnos',
    },
    {
      title: 'Gestión de Materias',
      description: 'Configurar materias por grado y tipo de evaluación.',
      icon: BookOpenIcon,
      color: 'from-purple-500 to-purple-600',
      href: '/materias',
    },
    {
      title: 'Generar Boletas',
      description: 'Crear, visualizar y descargar boletas de calificación.',
      icon: DocumentTextIcon,
      color: 'from-orange-500 to-orange-600',
      href: '/boletas',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            ¡Bienvenido de vuelta, {user?.username || 'Usuario'}!
          </h2>
          <p className="text-slate-600 mt-1">
            Aquí tienes un resumen de tu sistema de boletas.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                    <div className="h-8 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-12 w-12 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat) => (
              <div
                key={stat.name}
                onClick={() => navigate(stat.href)}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <span>Ver detalles</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <div
                key={action.title}
                onClick={() => navigate(action.href)}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                  <div className="flex items-center text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <span>Acceder</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Información del Usuario</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Usuario</span>
                <span className="text-sm font-medium text-slate-900">{user?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Email</span>
                <span className="text-sm font-medium text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Estado</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user?.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Registro</span>
                <span className="text-sm font-medium text-slate-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Estado del Sistema</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-800">Sistema operativo</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-blue-800">Base de datos conectada</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium text-purple-800">API funcionando correctamente</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
