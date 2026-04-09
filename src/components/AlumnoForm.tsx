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
    municipio: '',
    nombre_representante: '',
    telefono_representante: '',
    correo_representante: '',
    direccion_representante: '',
    correo_estudiante: '',
    grado: undefined,
    seccion: '',
    numero_lista: undefined,
    modalidad: 'Media General',
    status: 'presente',
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
        municipio: alumno.municipio || '',
        nombre_representante: alumno.nombre_representante || '',
        telefono_representante: alumno.telefono_representante || '',
        correo_representante: alumno.correo_representante || '',
        direccion_representante: alumno.direccion_representante || '',
        correo_estudiante: alumno.correo_estudiante || '',
        grado: alumno.grado,
        seccion: alumno.seccion || '',
        numero_lista: alumno.numero_lista,
        modalidad: alumno.modalidad || 'Media General',
        status: alumno.status || 'presente',
      });
    }
  }, [alumno]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
            (updateData as any)[key] = value;
          }
        });
        await alumnoApi.update(alumno.id, updateData);
      } else {
        // Create new alumno - require all fields
        const createData = { ...formData };
        
        // Ensure required fields are not empty
        if (!createData.cedula.trim() || !createData.nombre.trim() || !createData.apellido.trim()) {
          setError('Los campos Cédula, Nombre y Apellido son obligatorios');
          setLoading(false);
          return;
        }
        
        // Validate optional fields that are now required
        const requiredFields = ['codigo', 'fecha_nacimiento', 'lugar_nacimiento', 'estado_nacimiento', 
                               'nombre_representante', 'telefono_representante', 'correo_representante', 'direccion_representante', 
                               'correo_estudiante', 'seccion'];
        
        const missingFields = requiredFields.filter(field => !createData[field as keyof typeof createData]);
        if (missingFields.length > 0) {
          setError(`Todos los campos son obligatorios. Faltan: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }
        
        // Validate grado and numero_lista
        if (!createData.grado || createData.grado < 1 || createData.grado > 6) {
          setError('El año es obligatorio y debe estar entre 1 y 6');
          setLoading(false);
          return;
        }
        
        if (!createData.numero_lista || createData.numero_lista < 1) {
          setError('El número en lista es obligatorio y debe ser mayor a 0');
          setLoading(false);
          return;
        }
        
        console.log('Sending data to backend:', createData);
        await alumnoApi.create(createData);
      }
      onSave();
    } catch (err: any) {
      console.log('Full error object:', err);
      console.log('Response data:', err?.response?.data);
      console.log('Response status:', err?.response?.status);
      console.log('Response headers:', err?.response?.headers);
      
      const errorMessage = err?.response?.data?.detail || 
                          err?.response?.data?.message ||
                          (alumno ? 'Error al actualizar el alumno' : 'Error al crear el alumno');
      setError(errorMessage);
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
              Código *
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lugar de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar de Nacimiento *
            </label>
            <input
              type="text"
              name="lugar_nacimiento"
              value={formData.lugar_nacimiento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Nacimiento *
            </label>
            <input
              type="text"
              name="estado_nacimiento"
              value={formData.estado_nacimiento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Municipio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipio
            </label>
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              onChange={handleInputChange}
              placeholder="Ej: Libertador"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nombre del Representante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Representante *
            </label>
            <input
              type="text"
              name="nombre_representante"
              value={formData.nombre_representante}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Teléfono del Representante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Representante *
            </label>
            <input
              type="tel"
              name="telefono_representante"
              value={formData.telefono_representante}
              onChange={handleInputChange}
              required
              placeholder="Ej: 0414-1234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Correo del Representante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo del Representante *
            </label>
            <input
              type="email"
              name="correo_representante"
              value={formData.correo_representante}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Información Académica */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Académica</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año *
              </label>
              <select
                name="grado"
                value={formData.grado || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                {[1, 2, 3, 4, 5, 6].map(grado => (
                  <option key={grado} value={grado}>{grado}° Año</option>
                ))}
              </select>
            </div>

            {/* Sección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección *
              </label>
              <input
                type="text"
                name="seccion"
                value={formData.seccion}
                onChange={handleInputChange}
                placeholder="Ej: A, B, C"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Número en Lista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número en Lista *
              </label>
              <input
                type="number"
                name="numero_lista"
                value={formData.numero_lista || ''}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              </select>
            </div>

            {/* Correo del Estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo del Estudiante *
              </label>
              <input
                type="email"
                name="correo_estudiante"
                value={formData.correo_estudiante}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estatus del Alumno
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Ej: presente, egresado, retirado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dirección del Representante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del Representante *
          </label>
          <textarea
            name="direccion_representante"
            value={formData.direccion_representante}
            onChange={handleInputChange}
            rows={3}
            required
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
