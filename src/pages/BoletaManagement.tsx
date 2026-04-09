import React, { useState } from 'react';
import { alumnoApi, boletaApi, type Alumno, type BoletaList } from '../services/api';
import Navbar from '../components/Navbar';
import BoletaGenerator from '../components/BoletaGenerator';
import BoletaView from '../components/BoletaView';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const BoletaManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'generator' | 'view'>('search');
  const [selectedBoleta, setSelectedBoleta] = useState<BoletaList | undefined>();
  const [searchCedula, setSearchCedula] = useState('');
  const [searchingAlumno, setSearchingAlumno] = useState(false);
  const [loadingBoletas, setLoadingBoletas] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [boletas, setBoletas] = useState<BoletaList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bulkDownloadLoading, setBulkDownloadLoading] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    grado: 1,
    seccion: 'A',
    anioEscolar: '2024/2025',
    tipoEvaluacion: 'Lapso 1'
  });

  const handleGenerateNew = () => {
    setSelectedBoleta(undefined);
    setCurrentView('generator');
  };

  const handleView = (boleta: BoletaList) => {
    setSelectedBoleta(boleta);
    setCurrentView('view');
  };

  const handleSave = () => {
    setCurrentView('search');
    setSelectedBoleta(undefined);
    // Refresh search if we have an alumno
    if (alumno) {
      handleSearch();
    }
  };

  const handleCancel = () => {
    setCurrentView('search');
    setSelectedBoleta(undefined);
  };

  const handleSearch = async () => {
    if (!searchCedula.trim()) {
      setError('Por favor ingrese un número de cédula');
      setAlumno(null);
      setBoletas([]);
      return;
    }

    try {
      setSearchingAlumno(true);
      setError(null);
      
      // First find the alumno by cedula
      const alumnoData = await alumnoApi.getByCedula(searchCedula);
      setAlumno(alumnoData);
      
      // Then find boletas for this alumno
      setLoadingBoletas(true);
      const boletasData = await boletaApi.getAll(0, 100, alumnoData.id);
      setBoletas(boletasData);
    } catch (err) {
      setAlumno(null);
      setBoletas([]);
      setError('No se encontró un alumno con esa cédula');
    } finally {
      setSearchingAlumno(false);
      setLoadingBoletas(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta boleta?')) {
      return;
    }

    try {
      await boletaApi.delete(id);
      setBoletas(boletas.filter(b => b.id !== id));
    } catch (err) {
      setError('Error al eliminar la boleta');
    }
  };

  const handleDownloadPdf = async (boleta: BoletaList) => {
    try {
      const blob = await boletaApi.downloadPdf(boleta.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${searchCedula}_${boleta.tipo_evaluacion?.replace(' ', '_') || 'evaluacion'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar el PDF');
    }
  };

  const handleBulkDownload = async () => {
    try {
      setBulkDownloadLoading(true);
      setError(null);
      
      const blob = await boletaApi.downloadBulkPdf(
        bulkForm.grado,
        bulkForm.seccion,
        bulkForm.anioEscolar,
        bulkForm.tipoEvaluacion
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletas_${bulkForm.grado}${bulkForm.seccion}_${bulkForm.anioEscolar.replace('/', '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar las boletas de la sección');
    } finally {
      setBulkDownloadLoading(false);
    }
  };

  const handleBulkFormChange = (field: string, value: string | number) => {
    setBulkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTipoBadgeColor = (tipo: string | undefined) => {
    if (!tipo) return 'bg-gray-100 text-gray-700';
    if (tipo.includes('Final')) return 'bg-purple-100 text-purple-700';
    if (tipo.includes('Lapso 1')) return 'bg-blue-100 text-blue-700';
    if (tipo.includes('Lapso 2')) return 'bg-amber-100 text-amber-700';
    if (tipo.includes('Lapso 3')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
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
                <h2 className="text-2xl font-bold text-slate-900">Gestión de Boletas</h2>
                <p className="text-slate-600 mt-1">Busque boletas por cédula del alumno</p>
              </div>
              <button
                onClick={handleGenerateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Generar Boleta
              </button>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Buscar Boletas</h3>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchCedula}
                    onChange={(e) => setSearchCedula(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingrese número de cédula del alumno"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchingAlumno}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {searchingAlumno ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Bulk Download Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Descargar Boletas por Sección</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Grado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grado
                  </label>
                  <select
                    value={bulkForm.grado}
                    onChange={(e) => handleBulkFormChange('grado', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(grado => (
                      <option key={grado} value={grado}>{grado}° Grado</option>
                    ))}
                  </select>
                </div>

                {/* Sección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección
                  </label>
                  <input
                    type="text"
                    value={bulkForm.seccion}
                    onChange={(e) => handleBulkFormChange('seccion', e.target.value)}
                    placeholder="Ej: A, B, C"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Año Escolar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año Escolar
                  </label>
                  <input
                    type="text"
                    value={bulkForm.anioEscolar}
                    onChange={(e) => handleBulkFormChange('anioEscolar', e.target.value)}
                    placeholder="Ej: 2024/2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Tipo Evaluación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lapso / Evaluación
                  </label>
                  <select
                    value={bulkForm.tipoEvaluacion}
                    onChange={(e) => handleBulkFormChange('tipoEvaluacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Lapso 1">Lapso 1</option>
                    <option value="Lapso 2">Lapso 2</option>
                    <option value="Lapso 3">Lapso 3</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleBulkDownload}
                disabled={bulkDownloadLoading}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                {bulkDownloadLoading ? 'Descargando...' : 'Descargar Todas las Boletas'}
              </button>
            </div>

            {/* Alumno Info & Boletas */}
            {alumno && (
              <div className="space-y-4">
                {/* Alumno Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {alumno.nombre[0]}{alumno.apellido[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {alumno.nombre} {alumno.apellido}
                        </h3>
                        <p className="text-slate-600 flex items-center gap-2 mt-1">
                          <IdentificationIcon className="h-4 w-4" />
                          C.I: {alumno.cedula}
                        </p>
                        {alumno.codigo && (
                          <p className="text-slate-500 text-sm mt-1">
                            Código: {alumno.codigo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boletas List */}
                {loadingBoletas ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : boletas.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Boletas Encontradas ({boletas.length})
                    </h3>
                    {boletas.map((boleta) => (
                      <div
                        key={boleta.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoBadgeColor(boleta.tipo_evaluacion)}`}>
                                  {boleta.tipo_evaluacion || 'N/A'}
                                </span>
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {boleta.anio_escolar || 'N/A'}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1">
                                <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                                {boleta.grado ? `${boleta.grado}° Grado` : 'N/A'} - Sección {boleta.seccion || 'N/A'}
                              </p>
                              {boleta.created_at && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Generada: {new Date(boleta.created_at).toLocaleDateString('es-ES')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(boleta)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Ver
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(boleta)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDelete(boleta.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                    <DocumentTextIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No hay boletas registradas para este alumno</p>
                    <button
                      onClick={handleGenerateNew}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Generar primera boleta →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!alumno && !error && !searchingAlumno && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                  <MagnifyingGlassIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Busque boletas</h3>
                <p className="text-slate-500 mt-1">Ingrese la cédula del alumno para ver sus boletas</p>
              </div>
            )}
          </div>
        ) : currentView === 'generator' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Volver
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Generar Boleta</h2>
            </div>
            <BoletaGenerator onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('search')}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Volver
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Ver Boleta</h2>
            </div>
            {selectedBoleta && (
              <BoletaView 
                boleta={selectedBoleta} 
                onBack={() => setCurrentView('search')} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BoletaManagement;
