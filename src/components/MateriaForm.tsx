import React, { useState, useEffect } from 'react';
import { materiaApi, type Materia, type MateriaCreate, type MateriaUpdate } from '../services/api';

interface MateriaFormProps {
  materia?: Materia;
  onSave: () => void;
  onCancel: () => void;
}

const MateriaForm: React.FC<MateriaFormProps> = ({ materia, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MateriaCreate>({
    nombre: '',
    grado: 1,
    es_numerica: true,
    modalidad: 'Media General',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (materia) {
      setFormData({
        nombre: materia.nombre,
        grado: materia.grado,
        es_numerica: materia.es_numerica,
        modalidad: materia.modalidad || 'Media General',
      });
    }
  }, [materia]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'grado' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (materia) {
        // Update existing materia
        const updateData: MateriaUpdate = {
          nombre: formData.nombre,
          grado: formData.grado,
          es_numerica: formData.es_numerica,
          modalidad: formData.modalidad,
        };
        await materiaApi.update(materia.id, updateData);
      } else {
        // Create new materia
        await materiaApi.create(formData);
      }
      onSave();
    } catch (err) {
      setError(materia ? 'Error al actualizar la materia' : 'Error al crear la materia');
      console.error('Error saving materia:', err);
    } finally {
      setLoading(false);
    }
  };

  const grados = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {materia ? 'Editar Materia' : 'Nueva Materia'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Materia *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Matemáticas, Historia, etc."
          />
        </div>

        {/* Grado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año *
          </label>
          <select
            name="grado"
            value={formData.grado}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {grados.map(grado => (
              <option key={grado} value={grado}>
                {grado}° Año
              </option>
            ))}
          </select>
        </div>

        {/* Modalidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modalidad
          </label>
          <select
            name="modalidad"
            value={formData.modalidad}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Media General">Media General</option>
            <option value="Técnica">Técnica</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Humanidades">Humanidades</option>
            <option value="Ambas">Ambas</option>
            <option value="Todas">Todas</option>
          </select>
        </div>

        {/* Tipo de Calificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Calificación
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="es_numerica"
                checked={formData.es_numerica}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Calificación Numérica (1-20)
              </span>
            </label>
          </div>
          {!formData.es_numerica && (
            <p className="mt-2 text-sm text-gray-500">
              Las calificaciones literales usan escalas como: A, B, C, D, F o Excelente, Bueno, Regular, Deficiente
            </p>
          )}
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Nombre:</strong> {formData.nombre || '(Sin nombre)'}</p>
            <p><strong>Año:</strong> {formData.grado}°</p>
            <p><strong>Modalidad:</strong> {formData.modalidad}</p>
            <p><strong>Tipo:</strong> {formData.es_numerica ? 'Numérica (1-20)' : 'Literal'}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (materia ? 'Actualizar' : 'Crear')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default MateriaForm;
