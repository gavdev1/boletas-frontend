import React, { useState, useEffect } from 'react';
import { materiaApi, type Materia } from '../services/api';

interface MateriasListProps {
  onEdit: (materia: Materia) => void;
}

const MateriasList: React.FC<MateriasListProps> = ({ onEdit }) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGrado, setFilterGrado] = useState<number | undefined>();

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const data = await materiaApi.getAll(0, 100, filterGrado);
      setMaterias(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las materias');
      console.error('Error fetching materias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
      return;
    }

    try {
      await materiaApi.delete(id);
      setMaterias(materias.filter(materia => materia.id !== id));
    } catch (err) {
      setError('Error al eliminar la materia');
      console.error('Error deleting materia:', err);
    }
  };

  const handleGradoFilter = (grado: number | undefined) => {
    setFilterGrado(grado);
  };

  useEffect(() => {
    fetchMaterias();
  }, [filterGrado]);

  const grados = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Materias</h2>
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Filtrar por Año</h3>
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando materias...</p>
        </div>
      ) : (
        <>
          {/* Materias Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Año</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{materia.nombre}</td>
                    <td className="border border-gray-300 px-4 py-2">{materia.grado}°</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        materia.es_numerica 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {materia.es_numerica ? 'Numérica' : 'Literal'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(materia)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(materia.id)}
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
            
            {materias.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {filterGrado !== undefined 
                    ? `No hay materias registradas para ${filterGrado}° año` 
                    : 'No hay materias registradas'
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

export default MateriasList;
