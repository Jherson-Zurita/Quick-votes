import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useUser } from '@clerk/clerk-react';

export const RafflePlayer = ({ activityId }) => {
  const [raffle, setRaffle] = useState(null);
  const [activity, setActivity] = useState(null); // Añadido para obtener la actividad completa
  const [isParticipating, setIsParticipating] = useState(false);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        // Obtener los detalles de la actividad para verificar el propietario
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
          
        if (activityError) throw activityError;
        setActivity(activityData);
        
        // Obtener los elementos/contenido del sorteo
        const { data, error } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (error) throw error;
        setRaffle(data?.content || null);

        // Obtener los ganadores si ya se realizó el sorteo
        if (activityData.settings?.winners) {
          setWinners(activityData.settings.winners);
        }

        // Verificar si el usuario ya participó
        if (user) {
          const { data: participation, error: partError } = await supabase
            .from('participations')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

          if (!partError && participation) {
            setIsParticipating(true);
          }
        }
      } catch (error) {
        console.error('Error fetching raffle:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaffle();
  }, [activityId, supabase, user]);

  const handleParticipate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('participations').insert([{
        activity_id: activityId,
        user_id: user.id, // Asegúrate de incluir el user_id
        responses: { participated: true }
      }]);

      if (error) throw error;
      setIsParticipating(true);
    } catch (error) {
      console.error('Error participating:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const drawWinners = async () => {
    setIsDrawing(true);
    try {
      // Get all participants
      const { data: participants, error: partError } = await supabase
        .from('participations')
        .select('user_id, profiles:user_id (username, avatar_url)')
        .eq('activity_id', activityId);

      if (partError) throw partError;

      if (!participants || participants.length === 0) {
        alert('No hay participantes aún');
        return;
      }

      // Select winners for each prize
      const selectedWinners = [];
      const shuffled = [...participants].sort(() => 0.5 - Math.random());

      raffle.prizes.forEach((prize, prizeIndex) => {
        // Calcular el inicio del slice para este premio
        // para evitar seleccionar ganadores repetidos entre premios
        const startIndex = prizeIndex > 0 
          ? selectedWinners.length 
          : 0;
          
        // Si no hay suficientes participantes, usar los disponibles
        const availableWinners = Math.min(prize.quantity, shuffled.length - startIndex);
        
        if (availableWinners <= 0) return; // No hay suficientes participantes para este premio
        
        const prizeWinners = shuffled
          .slice(startIndex, startIndex + availableWinners)
          .map(winner => ({
            prize: prize.name,
            user: winner.profiles?.username || 'Anónimo',
            avatar: winner.profiles?.avatar_url || null,
            user_id: winner.user_id
          }));
        
        selectedWinners.push(...prizeWinners);
      });

      setWinners(selectedWinners);

      // Save results
      const { error } = await supabase
        .from('activities')
        .update({
          settings: { winners: selectedWinners },
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error drawing winners:', error.message);
    } finally {
      setIsDrawing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-black">Cargando sorteo...</div>;
  }

  if (!raffle) {
    return <div className="text-center py-8 text-black">No se encontró el sorteo</div>;
  }

  // Verificar si el usuario actual es el propietario de la actividad
  const isOwner = user && activity && user.id === activity.user_id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-black mb-2">{raffle.title}</h2>
        {raffle.description && (
          <p className="text-black mb-4">{raffle.description}</p>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Premios disponibles</h3>
          <ul className="space-y-2">
            {raffle.prizes.map((prize, index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-black">{prize.name}</span>
                <span className="text-sm text-black">{prize.quantity} disponible(s)</span>
              </li>
            ))}
          </ul>
        </div>

        {!isParticipating ? (
          <button
            onClick={handleParticipate}
            disabled={isLoading || !user}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user ? 'Participar en el sorteo' : 'Inicia sesión para participar'}
          </button>
        ) : (
          <div className="text-center py-4 text-green-600 font-medium">
            ¡Ya estás participando en este sorteo!
          </div>
        )}
      </div>

      {isOwner && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-black mb-4">Administrar sorteo</h3>
          <button
            onClick={drawWinners}
            disabled={isDrawing}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDrawing ? 'Sorteando...' : 'Realizar sorteo'}
          </button>
        </div>
      )}

      {winners.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-black mb-4 text-center">¡Ganadores!</h3>
          <ul className="space-y-3">
            {winners.map((winner, index) => (
              <li key={index} className="flex items-center space-x-3 p-3 border rounded">
                {winner.avatar ? (
                  <img
                    src={winner.avatar}
                    alt={winner.user}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-black">{winner.user.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-black">{winner.user}</p>
                  <p className="text-sm text-black">Ganó: {winner.prize}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};