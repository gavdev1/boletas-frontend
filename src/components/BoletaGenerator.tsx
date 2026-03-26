import React, { useState, useEffect } from 'react';
import { alumnoApi, materiaApi, boletaApi, calificacionApi, configuracionApi, type Alumno, type Materia, type BoletaCreate, type CalificacionCreate } from '../services/api';

interface BoletaGeneratorProps {
  onSave: () => void;
  onCancel: () => void;
}

const BoletaGenerator: React.FC<BoletaGeneratorProps> = ({ onSave, onCancel }) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [cedulaBusqueda, setCedulaBusqueda] = useState('');
  const [anioEscolar, setAnioEscolar] = useState('');
  const [grado, setGrado] = useState(1);
  const [seccion, setSeccion] = useState('A');
  const [modalidad, setModalidad] = useState('Media General');
  const [numeroLista, setNumeroLista] = useState('');
  const [inasistenciasLapso1, setInasistenciasLapso1] = useState('');
  const [inasistenciasLapso2, setInasistenciasLapso2] = useState('');
  const [inasistenciasLapso3, setInasistenciasLapso3] = useState('');
  const [tipoEvaluacion, setTipoEvaluacion] = useState('Final');
  const [profesor, setProfesor] = useState('');
  const [nombrePlantel, setNombrePlantel] = useState('');
  const [direccionPlantel, setDireccionPlantel] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Calificaciones
  const [calificaciones, setCalificaciones] = useState<CalificacionCreate[]>([]);

  const loadConfig = async () => {
    try {
      const config = await configuracionApi.get();
      setAnioEscolar(config.anio_escolar_actual || '');
      setProfesor(config.profesor_guia_default || '');
      setNombrePlantel(config.nombre_plantel || '');
      setDireccionPlantel(config.direccion_plantel || '');
    } catch (err) {
      console.error('Error loading config:', err);
      // Use empty defaults if config fails to load
    }
  };

  const tiposEvaluacion = ['Lapso 1', 'Lapso 2', 'Lapso 3', 'Final'];
  const secciones = ['A', 'B', 'C', 'D', 'E', 'F'];
  const grados = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    fetchMaterias();
    loadConfig();
  }, []);

  useEffect(() => {
    if (grado) {
      fetchMateriasPorGradoYModalidad();
    }
  }, [grado, modalidad]);

  useEffect(() => {
    // Update modalidad, grado, seccion when alumno changes
    if (selectedAlumno) {
      setModalidad(selectedAlumno.modalidad || 'Media General');
      if (selectedAlumno.grado) {
        setGrado(selectedAlumno.grado);
      }
      if (selectedAlumno.seccion) {
        setSeccion(selectedAlumno.seccion);
      }
      if (selectedAlumno.numero_lista) {
        setNumeroLista(selectedAlumno.numero_lista.toString());
      }
    }
  }, [selectedAlumno]);

  useEffect(() => {
    // Load existing calificaciones when alumno or anio_escolar changes
    if (selectedAlumno && anioEscolar) {
      loadExistingCalificaciones();
    }
  }, [selectedAlumno?.id, anioEscolar]);

  const buscarAlumnoPorCedula = async (cedula: string) => {
    if (!cedula.trim()) {
      setError('Debe ingresar una cédula');
      return;
    }
    
    try {
      const alumno = await alumnoApi.getByCedula(cedula);
      setSelectedAlumno(alumno);
      setCedulaBusqueda(`${alumno.nombre} ${alumno.apellido} - ${alumno.cedula}`);
      setError(null);
    } catch (err) {
      setError('Alumno no encontrado');
      setSelectedAlumno(null);
      setCedulaBusqueda('');
      console.error('Error searching alumno:', err);
    }
  };

  const handleCedulaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarAlumnoPorCedula(cedulaBusqueda);
    }
  };

  const fetchMaterias = async () => {
    try {
      const data = await materiaApi.getAll();
      setMaterias(data);
    } catch (err) {
      setError('Error al cargar las materias');
      console.error('Error fetching materias:', err);
    }
  };

  const fetchMateriasPorGradoYModalidad = async () => {
    try {
      const data = await materiaApi.getAll(0, 100, grado, modalidad);
      setMaterias(data);
      
      // Initialize calificaciones for the new grade's materias
      const newCalificaciones = data.map((materia: Materia) => ({
        alumno_id: selectedAlumno?.id || 0,
        materia_id: materia.id,
        anio_escolar: anioEscolar,
        lapso_1_def: undefined,
        lapso_2_def: undefined,
        lapso_3_def: undefined,
        def_final: undefined,
        literal: undefined
      }));
      setCalificaciones(newCalificaciones);
    } catch (err) {
      setError('Error al cargar las materias');
      console.error('Error fetching materias:', err);
    }
  };

  const loadExistingCalificaciones = async () => {
    if (!selectedAlumno) return;
    
    try {
      const existingCalifs = await calificacionApi.getByAlumno(selectedAlumno.id, anioEscolar);
      
      // Create a map of existing calificaciones by materia_id
      const califMap = new Map();
      existingCalifs.forEach(calif => {
        if (!califMap.has(calif.materia_id)) {
          califMap.set(calif.materia_id, {
            alumno_id: selectedAlumno?.id || 0,
            materia_id: calif.materia_id,
            anio_escolar: anioEscolar,
            lapso_1_def: undefined,
            lapso_2_def: undefined,
            lapso_3_def: undefined,
            def_final: undefined,
            literal: undefined
          });
        }
        
        const materiaCalif = califMap.get(calif.materia_id);
        
        // Map lapso notes to the correct fields
        if (calif.lapso_1_def !== undefined && calif.lapso_1_def !== null) {
          materiaCalif.lapso_1_def = calif.lapso_1_def;
        }
        if (calif.lapso_2_def !== undefined && calif.lapso_2_def !== null) {
          materiaCalif.lapso_2_def = calif.lapso_2_def;
        }
        if (calif.lapso_3_def !== undefined && calif.lapso_3_def !== null) {
          materiaCalif.lapso_3_def = calif.lapso_3_def;
        }
        if (calif.def_final !== undefined && calif.def_final !== null) {
          materiaCalif.def_final = calif.def_final;
        }
        if (calif.literal) {
          materiaCalif.literal = calif.literal;
        }
      });
      
      // Merge with current materias
      const mergedCalificaciones = materias.map((materia: Materia) => {
        const existing = califMap.get(materia.id);
        return existing || {
          alumno_id: selectedAlumno?.id || 0,
          materia_id: materia.id,
          anio_escolar: anioEscolar,
          lapso_1_def: undefined,
          lapso_2_def: undefined,
          lapso_3_def: undefined,
          def_final: undefined,
          literal: undefined
        };
      });
      
      setCalificaciones(mergedCalificaciones);
    } catch (err) {
      console.error('Error loading existing calificaciones:', err);
      // Don't show error to user, just continue with empty calificaciones
    }
  };

  const calcularDefinitivo = (lapso1: number | undefined, lapso2: number | undefined, lapso3: number | undefined): number | undefined => {
    const notas = [lapso1, lapso2, lapso3].filter(nota => nota !== undefined && nota !== null && nota !== 0) as number[];
    if (notas.length === 0) return undefined;
    
    // Calcular promedio de las notas disponibles
    const suma = notas.reduce((acc, nota) => acc + nota, 0);
    return Math.round((suma / notas.length) * 100) / 100; // Redondear a 2 decimales
  };

  const getLapsoEditable = (): number => {
    // Determinar qué lapso se puede editar según el tipo de evaluación
    if (tipoEvaluacion.includes('Lapso 1')) return 1;
    if (tipoEvaluacion.includes('Lapso 2')) return 2;
    if (tipoEvaluacion.includes('Lapso 3') || tipoEvaluacion.includes('Final')) return 3;
    return 3; // Default
  };

  const handleCalificacionChange = (materiaId: number, field: keyof CalificacionCreate, value: number | string | undefined) => {
    setCalificaciones(prev => {
      const updated = prev.map(cal => {
        if (cal.materia_id === materiaId) {
          const newCal = { ...cal, [field]: value || undefined };
          
          // Si se está cambiando un lapso, recalcular el definitivo
          if (field === 'lapso_1_def' || field === 'lapso_2_def' || field === 'lapso_3_def') {
            const materia = materias.find(m => m.id === materiaId);
            if (materia?.es_numerica) {
              const definitivo = calcularDefinitivo(newCal.lapso_1_def, newCal.lapso_2_def, newCal.lapso_3_def);
              newCal.def_final = definitivo;
            }
          }
          
          return newCal;
        }
        return cal;
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAlumno) {
      setError('Debe buscar y seleccionar un alumno');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Guardar calificaciones primero
      const calificacionesConNotas = calificaciones.filter(cal => 
        cal.lapso_1_def || cal.lapso_2_def || cal.lapso_3_def || cal.def_final || cal.literal
      );

      for (const cal of calificacionesConNotas) {
        // Guardar cada lapso que tenga nota
        if (cal.lapso_1_def !== undefined && cal.lapso_1_def !== null) {
          await calificacionApi.registrarNota({
            alumno_id: selectedAlumno.id,
            materia_id: cal.materia_id,
            lapso: 1,
            nota: cal.lapso_1_def,
            anio_escolar: anioEscolar
          });
        }
        if (cal.lapso_2_def !== undefined && cal.lapso_2_def !== null) {
          await calificacionApi.registrarNota({
            alumno_id: selectedAlumno.id,
            materia_id: cal.materia_id,
            lapso: 2,
            nota: cal.lapso_2_def,
            anio_escolar: anioEscolar
          });
        }
        if (cal.lapso_3_def !== undefined && cal.lapso_3_def !== null) {
          await calificacionApi.registrarNota({
            alumno_id: selectedAlumno.id,
            materia_id: cal.materia_id,
            lapso: 3,
            nota: cal.lapso_3_def,
            anio_escolar: anioEscolar
          });
        }
        if (cal.literal) {
          await calificacionApi.registrarNota({
            alumno_id: selectedAlumno.id,
            materia_id: cal.materia_id,
            lapso: 3, // Usar lapso 3 para literales
            nota: cal.lapso_3_def || 0, // Usar la nota existente o 0 si no hay
            anio_escolar: anioEscolar,
            literal: cal.literal
          });
        }
      }

      // 2. Crear la boleta (que ahora usará las calificaciones guardadas)
      // Determinar hasta_lapso según tipo de evaluación
      let hastaLapso = 3; // Default para "Final"
      if (tipoEvaluacion.includes('Lapso 1')) hastaLapso = 1;
      else if (tipoEvaluacion.includes('Lapso 2')) hastaLapso = 2;
      else if (tipoEvaluacion.includes('Final')) hastaLapso = 3;
      
      const boletaData: BoletaCreate = {
        alumno_id: selectedAlumno.id,
        anio_escolar: anioEscolar,
        grado,
        seccion,
        modalidad,
        numero_lista: numeroLista ? parseInt(numeroLista) : undefined,
        inasistencias_lapso_1: inasistenciasLapso1 ? parseInt(inasistenciasLapso1) : 0,
        inasistencias_lapso_2: inasistenciasLapso2 ? parseInt(inasistenciasLapso2) : 0,
        inasistencias_lapso_3: inasistenciasLapso3 ? parseInt(inasistenciasLapso3) : 0,
        tipo_evaluacion: tipoEvaluacion,
        hasta_lapso: hastaLapso,
        observaciones: observaciones || undefined,
        profesor: profesor || undefined,
        nombre_plantel: nombrePlantel || undefined,
        direccion_plantel: direccionPlantel || undefined,
      };

      await boletaApi.create(boletaData);
      onSave();
    } catch (err) {
      setError('Error al crear la boleta');
      console.error('Error creating boleta:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMateriaById = (materiaId: number) => {
    return materias.find(m => m.id === materiaId);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generar Boleta</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Alumno y Boleta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda de Alumno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Alumno por Cédula *
            </label>
            <input
              type="text"
              value={cedulaBusqueda}
              onChange={(e) => setCedulaBusqueda(e.target.value)}
              onKeyPress={handleCedulaKeyPress}
              placeholder="Ingrese cédula y presione Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedAlumno && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✅ {selectedAlumno.nombre} {selectedAlumno.apellido} - {selectedAlumno.cedula}
              </div>
            )}
          </div>

          {/* Año Escolar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año Escolar *
            </label>
            <input
              type="text"
              value={anioEscolar}
              onChange={(e) => setAnioEscolar(e.target.value)}
              required
              placeholder="Ej: 2024/2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año *
            </label>
            <select
              value={grado}
              onChange={(e) => setGrado(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {grados.map(g => (
                <option key={g} value={g}>{g}° Año</option>
              ))}
            </select>
          </div>

          {/* Modalidad (no editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad *
            </label>
            <input
              type="text"
              value={modalidad}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              title="La modalidad se carga automáticamente según el alumno"
            />
          </div>

          {/* Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección *
            </label>
            <select
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {secciones.map(s => (
                <option key={s} value={s}>Sección {s}</option>
              ))}
            </select>
          </div>

          {/* Número en Lista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número en Lista
            </label>
            <input
              type="number"
              value={numeroLista}
              onChange={(e) => setNumeroLista(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Inasistencias Lapso 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inasistencias Lapso 1
            </label>
            <input
              type="number"
              value={inasistenciasLapso1}
              onChange={(e) => setInasistenciasLapso1(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Inasistencias Lapso 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inasistencias Lapso 2
            </label>
            <input
              type="number"
              value={inasistenciasLapso2}
              onChange={(e) => setInasistenciasLapso2(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Inasistencias Lapso 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inasistencias Lapso 3
            </label>
            <input
              type="number"
              value={inasistenciasLapso3}
              onChange={(e) => setInasistenciasLapso3(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Evaluación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evaluación *
            </label>
            <select
              value={tipoEvaluacion}
              onChange={(e) => setTipoEvaluacion(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposEvaluacion.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesor *  
            </label>
            <input
              type="text"
              required
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              placeholder="Nombre del profesor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Plantel *
            </label>
            <input
              type="text"
              required
              value={nombrePlantel}
              onChange={(e) => setNombrePlantel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del Plantel *
          </label>
          <input
            type="text"
            required
            value={direccionPlantel}
            onChange={(e) => setDireccionPlantel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales (opcional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Calificaciones */}
        {calificaciones.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Calificaciones</h3>
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
                  {calificaciones.map((calificacion) => {
                    const materia = getMateriaById(calificacion.materia_id);
                    if (!materia) return null;
                    
                    const lapsoEditable = getLapsoEditable();
                    
                    return (
                      <tr key={calificacion.materia_id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          <div>
                            <div className="font-medium">{materia.nombre}</div>
                            <div className="text-xs text-gray-500">
                              {materia.es_numerica ? 'Numérica' : 'Literal'}
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={calificacion.lapso_1_def || ''}
                            onChange={(e) => handleCalificacionChange(
                              calificacion.materia_id, 
                              'lapso_1_def', 
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                            disabled={lapsoEditable !== 1}
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-center ${
                              lapsoEditable === 1 
                                ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' 
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                            placeholder="-"
                            title={lapsoEditable === 1 ? "Editable" : "No editable - Lapso 1 bloqueado"}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={calificacion.lapso_2_def || ''}
                            onChange={(e) => handleCalificacionChange(
                              calificacion.materia_id, 
                              'lapso_2_def', 
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                            disabled={lapsoEditable !== 2}
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-center ${
                              lapsoEditable === 2 
                                ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' 
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                            placeholder="-"
                            title={lapsoEditable === 2 ? "Editable" : "No editable - Lapso 2 bloqueado"}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={calificacion.lapso_3_def || ''}
                            onChange={(e) => handleCalificacionChange(
                              calificacion.materia_id, 
                              'lapso_3_def', 
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                            disabled={lapsoEditable !== 3}
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-center ${
                              lapsoEditable === 3 
                                ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' 
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                            placeholder="-"
                            title={lapsoEditable === 3 ? "Editable" : "No editable - Lapso 3 bloqueado"}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {materia.es_numerica ? (
                            <input
                              type="text"
                              value={calificacion.def_final || ''}
                              readOnly
                              className="w-full px-2 py-1 border border-gray-300 rounded text-center bg-gray-100 text-gray-700 cursor-not-allowed"
                              placeholder="-"
                              title="Calculado automáticamente como promedio de los lapsos"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={calificacion.literal || ''}
                            onChange={(e) => handleCalificacionChange(
                              calificacion.materia_id, 
                              'literal', 
                              e.target.value || undefined
                            )}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="A-F"
                            maxLength={2}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !selectedAlumno}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Boleta'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedAlumno(null);
              setCedulaBusqueda('');
              onCancel();
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoletaGenerator;
