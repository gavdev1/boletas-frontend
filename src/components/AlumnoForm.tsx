import React, { useState, useEffect } from 'react';
import { alumnoApi, type Alumno, type AlumnoCreate, type AlumnoUpdate } from '../services/api';

interface AlumnoFormProps {
  alumno?: Alumno;
  onSave: () => void;
  onCancel: () => void;
}

const AlumnoForm: React.FC<AlumnoFormProps> = ({ alumno, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AlumnoCreate>({
    cedula: '',
    nombre: '',
    apellido: '',
    codigo: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    estado_nacimiento: '',
    nombre_representante: '',
    direccion_representante: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alumno) {
      setFormData({
        cedula: alumno.cedula,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        codigo: alumno.codigo || '',
        fecha_nacimiento: alumno.fecha_nacimiento || '',
        lugar_nacimiento: alumno.lugar_nacimiento || '',
        estado_nacimiento: alumno.estado_nacimiento || '',
        nombre_representante: alumno.nombre_representante || '',
        direccion_representante: alumno.direccion_representante || '',
      });
    }
  }, [alumno]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (alumno) {
        // Update existing alumno
        const updateData: AlumnoUpdate = {};
        Object.keys(formData).forEach(key => {
          const value = formData[key as keyof AlumnoCreate];
          if (value !== '' && value !== undefined) {
            updateData[key as keyof AlumnoUpdate] = value;
          }
        });
        await alumnoApi.update(alumno.id, updateData);
      } else {
        // Create new alumno
        await alumnoApi.create(formData);
      }
      onSave();
    } catch (err) {
      setError(alumno ? 'Error al actualizar el alumno' : 'Error al crear el alumno');
      console.error('Error saving alumno:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {alumno ? 'Editar Alumno' : 'Nuevo Alumno'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lugar de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar de Nacimiento
            </label>
            <input
              type="text"
              name="lugar_nacimiento"
              value={formData.lugar_nacimiento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Nacimiento
            </label>
            <input
              type="text"
              name="estado_nacimiento"
              value={formData.estado_nacimiento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nombre del Representante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Representante
            </label>
            <input
              type="text"
              name="nombre_representante"
              value={formData.nombre_representante}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dirección del Representante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del Representante
          </label>
          <textarea
            name="direccion_representante"
            value={formData.direccion_representante}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (alumno ? 'Actualizar' : 'Crear')}
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

export default AlumnoForm;
