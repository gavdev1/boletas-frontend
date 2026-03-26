import React, { useState, useEffect } from 'react';
import { seccionApi, type Seccion, type SeccionCreate, type SeccionUpdate } from '../services/api';

interface SeccionFormProps {
  seccion?: Seccion;
  onSave: () => void;
  onCancel: () => void;
}

const SeccionForm: React.FC<SeccionFormProps> = ({ seccion, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SeccionCreate>({
    grado: 1,
    letra: 'A',
    modalidad: 'Media General',
    anio_escolar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seccion) {
      setFormData({
        grado: seccion.grado,
        letra: seccion.letra,
        modalidad: seccion.modalidad || 'Media General',
        anio_escolar: seccion.anio_escolar || '',
      });
    }
  }, [seccion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'grado' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (seccion) {
        // Update existing seccion
        const updateData: SeccionUpdate = {
          grado: formData.grado,
          letra: formData.letra,
          modalidad: formData.modalidad,
          anio_escolar: formData.anio_escolar,
        };
        await seccionApi.update(seccion.id, updateData);
      } else {
        // Create new seccion
        await seccionApi.create(formData);
      }
      onSave();
    } catch (err) {
      setError(seccion ? 'Error al actualizar la sección' : 'Error al crear la sección');
      console.error('Error saving seccion:', err);
    } finally {
      setLoading(false);
    }
  };

  const grados = [1, 2, 3, 4, 5, 6];
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const modalidades = ['Media General', 'Técnica', 'Ciencias', 'Humanidades'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {seccion ? 'Editar Sección' : 'Nueva Sección'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grado *
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
                {grado}° Grado
              </option>
            ))}
          </select>
        </div>

        {/* Letra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sección (Letra) *
          </label>
          <select
            name="letra"
            value={formData.letra}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {letras.map(letra => (
              <option key={letra} value={letra}>
                Sección {letra}
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
            {modalidades.map(modalidad => (
              <option key={modalidad} value={modalidad}>
                {modalidad}
              </option>
            ))}
          </select>
        </div>

        {/* Año Escolar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año Escolar
          </label>
          <input
            type="text"
            name="anio_escolar"
            value={formData.anio_escolar}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 2023-2024"
          />
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Grado:</strong> {formData.grado}°</p>
            <p><strong>Sección:</strong> {formData.letra}</p>
            <p><strong>Modalidad:</strong> {formData.modalidad}</p>
            <p><strong>Año Escolar:</strong> {formData.anio_escolar || '(No especificado)'}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (seccion ? 'Actualizar' : 'Crear')}
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

export default SeccionForm;
