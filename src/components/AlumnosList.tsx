import React, { useState, useEffect } from 'react';
import { alumnoApi, type Alumno } from '../services/api';

interface AlumnosListProps {
  onEdit: (alumno: Alumno) => void;
}

const AlumnosList: React.FC<AlumnosListProps> = ({ onEdit }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCedula, setSearchCedula] = useState('');
  const [searchResult, setSearchResult] = useState<Alumno | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const data = await alumnoApi.getAll();
      setAlumnos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los alumnos');
      console.error('Error fetching alumnos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCedula.trim()) {
      setSearchResult(null);
      return;
    }

    try {
      setSearching(true);
      const result = await alumnoApi.getByCedula(searchCedula);
      setSearchResult(result);
      setError(null);
    } catch (err) {
      setSearchResult(null);
      setError('Alumno no encontrado');
      console.error('Error searching alumno:', err);
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
      setAlumnos(alumnos.filter(alumno => alumno.id !== id));
      if (searchResult && searchResult.id === id) {
        setSearchResult(null);
      }
    } catch (err) {
      setError('Error al eliminar el alumno');
      console.error('Error deleting alumno:', err);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Alumnos</h2>
      
      {/* Search Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Buscar por Cédula</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchCedula}
            onChange={(e) => setSearchCedula(e.target.value)}
            placeholder="Ingrese número de cédula"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        
        {searchResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-semibold text-green-800">Alumno Encontrado:</h4>
            <p className="text-green-700">{searchResult.nombre} {searchResult.apellido} - C.I: {searchResult.cedula}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onEdit(searchResult)}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(searchResult.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
        
        {error && error.includes('no encontrado') && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && !error.includes('no encontrado') && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando alumnos...</p>
        </div>
      ) : (
        <>
          {/* Alumnos Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Cédula</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Apellido</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Código</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{alumno.cedula}</td>
                    <td className="border border-gray-300 px-4 py-2">{alumno.nombre}</td>
                    <td className="border border-gray-300 px-4 py-2">{alumno.apellido}</td>
                    <td className="border border-gray-300 px-4 py-2">{alumno.codigo || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(alumno)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(alumno.id)}
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
            
            {alumnos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay alumnos registrados</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AlumnosList;
