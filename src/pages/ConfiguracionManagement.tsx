import React, { useState, useEffect } from 'react';
import { configuracionApi, type Configuracion, type ConfiguracionUpdate } from '../services/api';
import Navbar from '../components/Navbar';
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const ConfiguracionManagement: React.FC = () => {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [originalData, setOriginalData] = useState<ConfiguracionUpdate>({});
  const [formData, setFormData] = useState<ConfiguracionUpdate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasConfig, setHasConfig] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configuracionApi.get();
      setConfig(data);
      const initialData = {
        nombre_plantel: data.nombre_plantel || '',
        direccion_plantel: data.direccion_plantel || '',
        anio_escolar_actual: data.anio_escolar_actual || '',
        profesor_guia_default: data.profesor_guia_default || '',
      };
      setOriginalData(initialData);
      setFormData(initialData);
      setHasConfig(true);
      setError(null);
    } catch (err) {
      setHasConfig(false);
      setOriginalData({});
      setFormData({});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await configuracionApi.update(formData);
      setConfig(updated);
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Configuración Global</h2>
          <p className="text-slate-600 mt-1">
            Configure los valores predeterminados para el sistema de boletas
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : !hasConfig ? (
          /* Setup Card - No config exists */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 mb-4">
                <Cog6ToothIcon className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Configuración Inicial Requerida
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Aún no hay configuración guardada. Complete los datos para que aparezcan automáticamente en las boletas.
              </p>
              <button
                onClick={() => setHasConfig(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Configurar Ahora
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Nombre del Plantel */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-slate-500" />
                  Nombre del Plantel
                </label>
                <input
                  type="text"
                  name="nombre_plantel"
                  value={formData.nombre_plantel || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: U.E. Colegio Simón Bolívar"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Este nombre aparecerá en todas las boletas generadas
                </p>
              </div>

              {/* Dirección del Plantel */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <MapPinIcon className="h-4 w-4 text-slate-500" />
                  Dirección del Plantel
                </label>
                <input
                  type="text"
                  name="direccion_plantel"
                  value={formData.direccion_plantel || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: Calle Principal #45, Valencia"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Año Escolar Actual */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                  Año Escolar Actual
                </label>
                <input
                  type="text"
                  name="anio_escolar_actual"
                  value={formData.anio_escolar_actual || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: 2024-2025"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Se usará como valor predeterminado al generar nuevas boletas
                </p>
              </div>

              {/* Profesor Guía Default */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  Profesor Guía Predeterminado
                </label>
                <input
                  type="text"
                  name="profesor_guia_default"
                  value={formData.profesor_guia_default || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: Lic. Antonio Machado"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Last Updated Info */}
              {config?.updated_at && (
                <div className="flex items-center gap-2 text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                  <ArrowPathIcon className="h-4 w-4" />
                  Última actualización: {new Date(config.updated_at).toLocaleString('es-ES')}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Guardar Configuración
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Restaurar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-start gap-3">
            <Cog6ToothIcon className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-indigo-900">¿Dónde se usan estos valores?</h3>
              <ul className="mt-2 text-sm text-indigo-700 space-y-1 list-disc list-inside">
                <li>Nombre y dirección del plantel aparecen en el encabezado de las boletas</li>
                <li>El año escolar se prellena al generar nuevas boletas</li>
                <li>El profesor guía aparece como valor predeterminado en las boletas</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracionManagement;
