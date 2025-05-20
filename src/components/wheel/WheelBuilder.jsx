import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

export const WheelBuilder = ({ activityId }) => {
  const [title, setTitle] = useState('Ruleta de la Fortuna');
  const [description, setDescription] = useState('');
  const [segments, setSegments] = useState(['Premio 1', 'Premio 2', 'Inténtalo de nuevo']);
  const [isLoading, setIsLoading] = useState(false);
  const [wheelType, setWheelType] = useState('prizes'); // 'prizes' o 'participants'
  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const { supabase } = useSupabase();
  const [accessCode, setAccessCode] = useState(null);

  const navigate = useNavigate();

  // Cargar participantes cuando se selecciona la opción
  useEffect(() => {
    if (wheelType === 'participants') {
      fetchParticipants();
    }
  }, [wheelType]);

  useEffect(() => {
    const fetchAccessCode = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('access_code')
          .eq('id', activityId)
          .single();
        if (error) throw error;
        setAccessCode(data.access_code);
      } catch (err) {
        console.error('Error fetching access code:', err.message);
      }
    };
    fetchAccessCode();
    },[supabase, activityId]);


  // Función para obtener los participantes de la actividad
  const fetchParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      const { data, error } = await supabase
        .from('participations')
        .select('user_id, profiles:user_id(username, display_name, avatar_url)')
        .eq('activity_id', activityId);

      if (error) throw error;
      
      // Formatear los datos de participantes
      const formattedParticipants = data.map(p => ({
        id: p.user_id,
        name: p.profiles?.display_name || p.profiles?.username || 'Usuario anónimo'
      }));
      
      setParticipants(formattedParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error.message);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const addSegment = () => {
    setSegments([...segments, `Premio ${segments.length + 1}`]);
  };

  const removeSegment = (index) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index, value) => {
    const updatedSegments = [...segments];
    updatedSegments[index] = value;
    setSegments(updatedSegments);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Eliminar elementos existentes
      await supabase.from('activity_items').delete().eq('activity_id', activityId);

      // Crear el contenido dependiendo del tipo de ruleta
      const content = {
        title,
        description,
        wheelType,
        segments: wheelType === 'prizes' ? segments : participants.map(p => ({ id: p.id, name: p.name }))
      };

      // Insertar nuevo elemento
      const { error } = await supabase.from('activity_items').insert([{
        activity_id: activityId,
        content,
        position: 0
      }]);

      if (error) throw error;
      alert('Ruleta guardada exitosamente!');
      navigate(`/app/activity/${activityId}`);
    } catch (error) {
      console.error('Error saving wheel:', error.message);
      alert('Error al guardar la ruleta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="font-medium text-lg text-black mb-4">Configuración de la Ruleta</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1">
            Título de la ruleta
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1">
            Tipo de ruleta
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="prizes"
                checked={wheelType === 'prizes'}
                onChange={() => setWheelType('prizes')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-black">Ruleta de premios</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="participants"
                checked={wheelType === 'participants'}
                onChange={() => setWheelType('participants')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-black">Ruleta de participantes</span>
            </label>
          </div>
        </div>
      </div>

      {wheelType === 'prizes' ? (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-medium text-lg text-black mb-4">Segmentos de la Ruleta</h3>

          {segments.map((segment, index) => (
            <div key={index} className="mb-3 flex items-center space-x-2">
              <input
                type="text"
                value={segment}
                onChange={(e) => updateSegment(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
              />
              <button
                type="button"
                onClick={() => removeSegment(index)}
                disabled={segments.length <= 2}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSegment}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Añadir segmento
          </button>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-medium text-lg text-black mb-4">Participantes en la Ruleta</h3>
          {accessCode ? (
            <div className="mb-4 flex items-center space-x-2">
              <span className="font-mono bg-gray-100 p-2 rounded text-black">{accessCode}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(accessCode)}
                className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Copiar código
              </button>
            </div>
          ) : (
            <div className="text-gray-500 mb-4">Cargando código de unión...</div>
          )}
          {isLoadingParticipants ? (
            <div className="py-4 text-center text-black">Cargando participantes...</div>
          ) : participants.length === 0 ? (
            <div className="py-4 text-center text-black">
              No hay participantes en esta actividad todavía.
              <div className="mt-2 text-sm text-gray-500">
                Los participantes aparecerán en la ruleta una vez que se unan a la actividad.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded text-black font-medium">
                {participants.length} participantes disponibles para la ruleta
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded">
                {participants.map((participant, index) => (
                  <div 
                    key={index} 
                    className="p-2 border-b last:border-b-0 flex items-center text-black"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-full mr-2">
                      {index + 1}
                    </span>
                    <span>{participant.name}</span>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={fetchParticipants}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Actualizar lista de participantes
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || (wheelType === 'participants' && participants.length === 0)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Guardar Ruleta'}
      </button>
    </div>
  );
};