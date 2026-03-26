import React, { useState, useEffect } from 'react';
import { seccionApi, type Seccion } from '../services/api';

interface SeccionesListProps {
  onEdit: (seccion: Seccion) => void;
}

const SeccionesList: React.FC<SeccionesListProps> = ({ onEdit }) => {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGrado, setFilterGrado] = useState<number | undefined>();
  const [filterModalidad, setFilterModalidad] = useState<string | undefined>();

  const fetchSecciones = async () => {
    try {
      setLoading(true);
      const data = await seccionApi.getAll(0, 100);
      let filteredData = data;
      
      if (filterGrado !== undefined) {
        filteredData = filteredData.filter(seccion => seccion.grado === filterGrado);
      }
      
      if (filterModalidad) {
        filteredData = filteredData.filter(seccion => seccion.modalidad === filterModalidad);
      }
      
      setSecciones(filteredData);
      setError(null);
    } catch (err) {
      setError('Error al cargar las secciones');
      console.error('Error fetching secciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
      return;
    }

    try {
      await seccionApi.delete(id);
      setSecciones(secciones.filter(seccion => seccion.id !== id));
    } catch (err) {
      setError('Error al eliminar la sección');
      console.error('Error deleting seccion:', err);
    }
  };

  const handleGradoFilter = (grado: number | undefined) => {
    setFilterGrado(grado);
  };

  const handleModalidadFilter = (modalidad: string | undefined) => {
    setFilterModalidad(modalidad);
  };

  useEffect(() => {
    fetchSecciones();
  }, [filterGrado, filterModalidad]);

  const grados = [1, 2, 3, 4, 5, 6];
  const modalidades = ['Media General', 'Técnica', 'Ciencias', 'Humanidades'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Secciones</h2>
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Filtros</h3>
        
        {/* Grado Filter */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-600">Filtrar por Año</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleGradoFilter(undefined)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterGrado === undefined 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {grados.map(grado => (
              <button
                key={grado}
                onClick={() => handleGradoFilter(grado)}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterGrado === grado 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {grado}° Año
              </button>
            ))}
          </div>
        </div>

        {/* Modalidad Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-600">Filtrar por Modalidad</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleModalidadFilter(undefined)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterModalidad === undefined 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {modalidades.map(modalidad => (
              <button
                key={modalidad}
                onClick={() => handleModalidadFilter(modalidad)}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterModalidad === modalidad 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {modalidad}
              </button>
            ))}
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
          <p className="text-gray-500">Cargando secciones...</p>
        </div>
      ) : (
        <>
          {/* Secciones Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Año</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Sección</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Modalidad</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Año Escolar</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {secciones.map((seccion) => (
                  <tr key={seccion.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{seccion.grado}°</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Sección {seccion.letra}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        seccion.modalidad === 'Media General' 
                          ? 'bg-green-100 text-green-800'
                          : seccion.modalidad === 'Técnica'
                          ? 'bg-purple-100 text-purple-800'
                          : seccion.modalidad === 'Ciencias'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {seccion.modalidad || 'Media General'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {seccion.anio_escolar || (
                        <span className="text-gray-400 text-sm">No especificado</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(seccion)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(seccion.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {secciones.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {filterGrado !== undefined || filterModalidad !== undefined
                    ? 'No hay secciones que coincidan con los filtros seleccionados'
                    : 'No hay secciones registradas'
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

export default SeccionesList;
