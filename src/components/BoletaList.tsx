import React, { useState, useEffect } from 'react';
import { boletaApi, alumnoApi, type BoletaList, type Alumno } from '../services/api';

interface BoletaListProps {
  onView: (boleta: BoletaList) => void;
  onGenerateNew: () => void;
}

const BoletaList: React.FC<BoletaListProps> = ({ onView, onGenerateNew }) => {
  const [boletas, setBoletas] = useState<BoletaList[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAlumno, setFilterAlumno] = useState<number | undefined>();
  const [filterAnio, setFilterAnio] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const fetchBoletas = async () => {
    try {
      setLoading(true);
      const data = await boletaApi.getAll(0, 100, filterAlumno, filterAnio || undefined, filterTipo || undefined);
      setBoletas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las boletas');
      console.error('Error fetching boletas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const data = await alumnoApi.getAll();
      setAlumnos(data);
    } catch (err) {
      console.error('Error fetching alumnos:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta boleta?')) {
      return;
    }

    try {
      await boletaApi.delete(id);
      setBoletas(boletas.filter(boleta => boleta.id !== id));
    } catch (err) {
      setError('Error al eliminar la boleta');
      console.error('Error deleting boleta:', err);
    }
  };

  const handleDownloadPdf = async (id: number, alumnoCedula: string, tipoEvaluacion: string) => {
    try {
      const blob = await boletaApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${alumnoCedula}_${tipoEvaluacion.replace(' ', '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar el PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  const getAlumnoById = (id: number) => {
    return alumnos.find(a => a.id === id);
  };

  const clearFilters = () => {
    setFilterAlumno(undefined);
    setFilterAnio('');
    setFilterTipo('');
  };

  useEffect(() => {
    fetchBoletas();
    fetchAlumnos();
  }, [filterAlumno, filterAnio, filterTipo]);

  const tiposEvaluacion = ['Lapso 1', 'Lapso 2', 'Lapso 3', 'Final'];
  const aniosEscolares = ['2023/2024', '2024/2025', '2025/2026'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Boletas</h2>
        <button
          onClick={onGenerateNew}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Generar Nueva Boleta
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Alumno Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
            <select
              value={filterAlumno || ''}
              onChange={(e) => setFilterAlumno(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los alumnos</option>
              {alumnos.map(alumno => (
                <option key={alumno.id} value={alumno.id}>
                  {alumno.nombre} {alumno.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Año Escolar Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año Escolar</label>
            <select
              value={filterAnio}
              onChange={(e) => setFilterAnio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los años</option>
              {aniosEscolares.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>

          {/* Tipo Evaluación Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Evaluación</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposEvaluacion.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando boletas...</p>
        </div>
      ) : (
        <>
          {/* Boletas Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Alumno</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Año Escolar</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Grado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Sección</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo Evaluación</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Media L1</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Media L2</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Media L3</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Media Global</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {boletas.map((boleta) => {
                  const alumno = getAlumnoById(boleta.alumno_id);
                  return (
                    <tr key={boleta.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">
                            {alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno no encontrado'}
                          </div>
                          {alumno && (
                            <div className="text-xs text-gray-500">C.I: {alumno.cedula}</div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{boleta.anio_escolar || 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-2">{boleta.grado ? `${boleta.grado}°` : 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-2">{boleta.seccion || 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          boleta.tipo_evaluacion === 'Final' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {boleta.tipo_evaluacion || 'N/A'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {boleta.media_lapso_1 ? boleta.media_lapso_1.toFixed(2) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {boleta.media_lapso_2 ? boleta.media_lapso_2.toFixed(2) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {boleta.media_lapso_3 ? boleta.media_lapso_3.toFixed(2) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {boleta.medias_globales ? boleta.medias_globales.toFixed(2) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {boleta.created_at ? new Date(boleta.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onView(boleta)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(
                              boleta.id, 
                              alumno?.cedula || 'desconocido', 
                              boleta.tipo_evaluacion || 'Evaluación'
                            )}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handleDelete(boleta.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {boletas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {filterAlumno || filterAnio || filterTipo 
                    ? 'No se encontraron boletas con los filtros seleccionados' 
                    : 'No hay boletas registradas'
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BoletaList;
