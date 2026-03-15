import React, { useState } from 'react';
import { alumnoApi, type Alumno } from '../services/api';
import Navbar from '../components/Navbar';
import AlumnoForm from '../components/AlumnoForm';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  UserCircleIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const AlumnosManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'form'>('search');
  const [editingAlumno, setEditingAlumno] = useState<Alumno | undefined>();
  const [searchCedula, setSearchCedula] = useState('');
  const [searchResult, setSearchResult] = useState<Alumno | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingAlumno(undefined);
    setCurrentView('form');
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setCurrentView('form');
  };

  const handleSave = () => {
    setCurrentView('search');
    setEditingAlumno(undefined);
    // Refresh search if we were viewing a result
    if (searchResult) {
      handleSearch();
    }
  };

  const handleCancel = () => {
    setCurrentView('search');
    setEditingAlumno(undefined);
  };

  const handleSearch = async () => {
    if (!searchCedula.trim()) {
      setError('Por favor ingrese un número de cédula');
      setSearchResult(null);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const result = await alumnoApi.getByCedula(searchCedula);
      setSearchResult(result);
    } catch (err) {
      setSearchResult(null);
      setError('Alumno no encontrado con esa cédula');
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
      return;
    }

    try {
      await alumnoApi.delete(id);
      setSearchResult(null);
      setSearchCedula('');
    } catch (err) {
      setError('Error al eliminar el alumno');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'search' ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gestión de Alumnos</h2>
                <p className="text-slate-600 mt-1">Busque alumnos por número de cédula</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo Alumno
              </button>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Buscar Alumno</h3>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchCedula}
                    onChange={(e) => setSearchCedula(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingrese número de cédula"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Search Result */}
            {searchResult && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {searchResult.nombre[0]}{searchResult.apellido[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {searchResult.nombre} {searchResult.apellido}
                        </h3>
                        <p className="text-slate-600 flex items-center gap-2 mt-1">
                          <IdentificationIcon className="h-4 w-4" />
                          C.I: {searchResult.cedula}
                        </p>
                        {searchResult.codigo && (
                          <p className="text-slate-500 text-sm mt-1">
                            Código: {searchResult.codigo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(searchResult)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(searchResult.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                    {searchResult.fecha_nacimiento && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <UserIcon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Fecha de Nacimiento</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(searchResult.fecha_nacimiento).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    )}
                    {searchResult.lugar_nacimiento && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <UserCircleIcon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Lugar de Nacimiento</p>
                          <p className="text-sm font-medium text-slate-900">{searchResult.lugar_nacimiento}</p>
                        </div>
                      </div>
                    )}
                    {searchResult.nombre_representante && (
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <UserGroupIcon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Representante</p>
                          <p className="text-sm font-medium text-slate-900">{searchResult.nombre_representante}</p>
                          {searchResult.direccion_representante && (
                            <p className="text-sm text-slate-600">{searchResult.direccion_representante}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!searchResult && !error && !searching && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                  <MagnifyingGlassIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Busque un alumno</h3>
                <p className="text-slate-500 mt-1">Ingrese el número de cédula para encontrar un alumno</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Volver
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                {editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
              </h2>
            </div>
            <AlumnoForm
              alumno={editingAlumno}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AlumnosManagement;
