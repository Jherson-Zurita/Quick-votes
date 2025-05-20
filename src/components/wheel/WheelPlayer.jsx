import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useUser } from '@clerk/clerk-react';

export const WheelPlayer = ({ activityId }) => {
  const [wheelConfig, setWheelConfig] = useState(null);
  const [activity, setActivity] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSpun, setHasSpun] = useState(false);
  const [displaySegments, setDisplaySegments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);
  const { supabase } = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener detalles de la actividad
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
          
        if (activityError) throw activityError;
        setActivity(activityData);

        // Obtener configuración de la ruleta
        const { data, error } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (error) throw error;
        
        const wheelContent = data?.content || null;
        setWheelConfig(wheelContent);
        
        // Si es una ruleta de participantes, obtener participantes actualizados
        if (wheelContent?.wheelType === 'participants') {
          await fetchParticipants();
        } else {
          // Si es ruleta de premios, usar los segmentos directamente
          setDisplaySegments(wheelContent?.segments || []);
        }

        // Verificar si el usuario ya giró la ruleta
        if (user) {
          const { data: participation, error: partError } = await supabase
            .from('participations')
            .select('responses')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

          if (!partError && participation?.responses?.result) {
            setHasSpun(true);
            setResult(participation.responses.result);
          }
        }

        // Verificar si ya hay un ganador para ruleta de participantes
        if (wheelContent?.wheelType === 'participants' && activityData.settings?.winner) {
          setWinner(activityData.settings.winner);
        }
      } catch (error) {
        console.error('Error fetching wheel:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activityId, supabase, user]);

  const fetchParticipants = async () => {
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
      
      // Actualizar los segmentos a mostrar con los nombres de los participantes
      setDisplaySegments(formattedParticipants.map(p => p.name));
    } catch (error) {
      console.error('Error fetching participants:', error.message);
    }
  };

  const spinWheel = async () => {
    if (!displaySegments || displaySegments.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // Simular animación de giro
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 segundos
    const startTime = Date.now();
    const rotations = 5 + Math.random() * 3; // 5-8 rotaciones completas

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease in-out

      if (progress < 1) {
        const rotation = 360 * rotations * easedProgress;
        wheelRef.current.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(animate);
      } else {
        // Determinar resultado
        const segmentAngle = 360 / displaySegments.length;
        const normalizedRotation = (360 * rotations) % 360;
        const winningIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % displaySegments.length;
        const winningSegment = displaySegments[winningIndex];

        setResult(winningSegment);
        setIsSpinning(false);
        
        // Si es ruleta de participantes, guardar el ganador
        if (wheelConfig?.wheelType === 'participants') {
          const winningParticipant = participants[winningIndex];
          saveWinner(winningParticipant);
          setWinner(winningParticipant);
        } else {
          // Si es ruleta de premios, guardar el resultado para el usuario
          saveResult(winningSegment);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const saveResult = async (result) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('participations').upsert({
        activity_id: activityId,
        user_id: user.id,
        responses: { result },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'activity_id,user_id'
      });

      if (error) throw error;
      setHasSpun(true);
    } catch (error) {
      console.error('Error saving result:', error.message);
    }
  };

  const saveWinner = async (winnerData) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          settings: { winner: winnerData },
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving winner:', error.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-black">Cargando ruleta...</div>;
  }

  if (!wheelConfig) {
    return <div className="text-center py-8 text-black">No se encontró la ruleta</div>;
  }

  // Verificar si el usuario actual es el propietario de la actividad
  const isOwner = user && activity && user.id === activity.user_id;
  
  // Si es ruleta de participantes y no hay participantes
  if (wheelConfig.wheelType === 'participants' && displaySegments.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center text-black">
        <h2 className="text-2xl font-bold mb-4">{wheelConfig.title}</h2>
        <p className="mb-6">No hay participantes para esta ruleta todavía.</p>
        {isOwner && (
          <button
            onClick={fetchParticipants}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Actualizar participantes
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black mb-2">{wheelConfig.title}</h2>
        {wheelConfig.description && (
          <p className="text-black mb-4">{wheelConfig.description}</p>
        )}
        
        {wheelConfig.wheelType === 'participants' && (
          <p className="text-sm bg-indigo-50 text-indigo-800 p-2 rounded">
            {displaySegments.length} participantes en esta ruleta
          </p>
        )}
      </div>

      <div className="relative flex justify-center items-center">
        <div 
          ref={wheelRef}
          className="w-64 h-64 rounded-full border-8 border-gray-800 relative overflow-hidden transition-transform duration-100"
          style={{
            transform: 'rotate(0deg)',
            background: `conic-gradient(${displaySegments.map((_, i) => {
              const hue = (i * 360 / displaySegments.length) % 360;
              return `hsl(${hue}, 70%, 70%) ${i / displaySegments.length * 100}% ${(i + 1) / displaySegments.length * 100}%`;
            }).join(', ')})`
          }}
        >
          {displaySegments.map((segment, i) => (
            <div 
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${i * 360 / displaySegments.length + 180 / displaySegments.length}deg)`,
                width: '50%',
                left: '50%',
                transformOrigin: 'left center'
              }}
            >
              <span 
                className="text-xs font-medium text-black whitespace-nowrap"
                style={{
                  transform: 'rotate(90deg)',
                  transformOrigin: 'left center',
                  paddingLeft: '20px',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {segment}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-600"></div>
      </div>

      <div className="text-center">
        {(result || winner) && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="font-bold text-black">
              {wheelConfig.wheelType === 'participants' ? '¡Ganador!' : '¡Resultado!'}
            </p>
            <p className="text-black">
              {wheelConfig.wheelType === 'participants' && winner 
                ? winner.name 
                : result}
            </p>
          </div>
        )}

        {wheelConfig.wheelType === 'prizes' ? (
          // Botón para ruleta de premios - solo usuarios pueden girar
          <button
            onClick={spinWheel}
            disabled={isSpinning || (user && hasSpun) || !user}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? 'Inicia sesión para girar' 
              : hasSpun ? 'Ya giraste la ruleta' 
              : isSpinning ? 'Girando...' 
              : 'Girar la Ruleta'}
          </button>
        ) : (
          // Botón para ruleta de participantes - solo el creador puede girar
          isOwner && (
            <button
              onClick={spinWheel}
              disabled={isSpinning || winner !== null}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {winner !== null ? 'Ganador ya seleccionado' 
                : isSpinning ? 'Girando...' 
                : 'Seleccionar Ganador'}
            </button>
          )
        )}

        {wheelConfig.wheelType === 'prizes' && hasSpun && (
          <p className="mt-2 text-sm text-black">Solo puedes girar la ruleta una vez</p>
        )}
        
        {wheelConfig.wheelType === 'participants' && winner && isOwner && (
          <button
            onClick={() => {
              setWinner(null);
              setResult(null);
              // Limpiar ganador en la BD
              supabase
                .from('activities')
                .update({
                  settings: { winner: null },
                  updated_at: new Date().toISOString()
                })
                .eq('id', activityId);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Reiniciar selección
          </button>
        )}
      </div>
    </div>
  );
};