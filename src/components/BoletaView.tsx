import React, { useState, useEffect } from 'react';
import { boletaApi, alumnoApi, type Boleta, type BoletaList, type Alumno } from '../services/api';

interface BoletaViewProps {
  boleta: BoletaList;
  onBack: () => void;
}

const BoletaView: React.FC<BoletaViewProps> = ({ boleta, onBack }) => {
  const [fullBoleta, setFullBoleta] = useState<Boleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alumno, setAlumno] = useState<Alumno | null>(null);

  useEffect(() => {
    fetchFullBoleta();
    fetchAlumno();
  }, [boleta.id]);

  const fetchFullBoleta = async () => {
    try {
      setLoading(true);
      const data = await boletaApi.getById(boleta.id);
      setFullBoleta(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los detalles de la boleta');
      console.error('Error fetching full boleta:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumno = async () => {
    try {
      const data = await alumnoApi.getById(boleta.alumno_id);
      setAlumno(data);
    } catch (err) {
      console.error('Error fetching alumno:', err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await boletaApi.downloadPdf(boleta.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${alumno?.cedula || 'desconocido'}_${(boleta.tipo_evaluacion || 'evaluacion').replace(' ', '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar el PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando detalles de la boleta...</p>
        </div>
      </div>
    );
  }

  if (error || !fullBoleta || !alumno) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Volver
          </button>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalles de la Boleta</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Descargar PDF
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Boleta Information */}
      <div className="space-y-6">
        {/* Student Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Información del Alumno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nombre:</strong> {alumno.nombre} {alumno.apellido}</p>
              <p><strong>Cédula:</strong> {alumno.cedula}</p>
              <p><strong>Código:</strong> {alumno.codigo || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Fecha de Nacimiento:</strong> {alumno.fecha_nacimiento || 'N/A'}</p>
              <p><strong>Representante:</strong> {alumno.nombre_representante || 'N/A'}</p>
              <p><strong>Dirección:</strong> {alumno.direccion_representante || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Boleta Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Información de la Boleta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p><strong>Año Escolar:</strong> {fullBoleta.anio_escolar}</p>
              <p><strong>Grado:</strong> {fullBoleta.grado}°</p>
              <p><strong>Sección:</strong> {fullBoleta.seccion}</p>
            </div>
            <div>
              <p><strong>Tipo Evaluación:</strong> {fullBoleta.tipo_evaluacion}</p>
              <p><strong>Número en Lista:</strong> {fullBoleta.numero_lista || 'N/A'}</p>
              <p><strong>Media Global:</strong> {fullBoleta.medias_globales || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Profesor:</strong> {fullBoleta.profesor || 'N/A'}</p>
              <p><strong>Plantel:</strong> {fullBoleta.nombre_plantel || 'N/A'}</p>
              <p><strong>Fecha:</strong> {fullBoleta.created_at ? new Date(fullBoleta.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          {fullBoleta.observaciones && (
            <div className="mt-4">
              <p><strong>Observaciones:</strong> {fullBoleta.observaciones}</p>
            </div>
          )}
        </div>

        {/* Calificaciones */}
        {fullBoleta.calificaciones.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Calificaciones</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Materia</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Lapso 1</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Lapso 2</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Lapso 3</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Def. Final</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Literal</th>
                  </tr>
                </thead>
                <tbody>
                  {fullBoleta.calificaciones.map((calificacion) => (
                    <tr key={calificacion.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{calificacion.materia.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {calificacion.materia.es_numerica ? 'Numérica' : 'Literal'}
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {calificacion.lapso_1_def || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {calificacion.lapso_2_def || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {calificacion.lapso_3_def || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {calificacion.def_final || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {calificacion.literal || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* School Information */}
        {fullBoleta.direccion_plantel && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Información del Plantel</h3>
            <p><strong>Nombre:</strong> {fullBoleta.nombre_plantel}</p>
            <p><strong>Dirección:</strong> {fullBoleta.direccion_plantel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoletaView;
