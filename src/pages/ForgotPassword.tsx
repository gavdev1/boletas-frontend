import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, type ForgotPasswordRequest } from '../services/api';
import {
  AcademicCapIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordRequest>({
    email: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(formData);
      setMessage(response.message);
      if (response.recovery_token) {
        localStorage.setItem('reset_token', response.recovery_token);
        setTimeout(() => {
          navigate('/reset-password');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sistema de Boletas</h1>
          <p className="text-indigo-200 mt-2">Gestión académica simplificada</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-slate-500 text-center mb-6">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
            </p>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-indigo-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace</span>
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-indigo-200 text-sm mt-8">
          © 2024 Sistema de Boletas. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
