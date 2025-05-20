import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';

export const RaffleResults = ({ activityId }) => {
  const [winners, setWinners] = useState([]);
  const [raffleTitle, setRaffleTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get raffle info
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .select('title, settings')
          .eq('id', activityId)
          .single();

        if (activityError) throw activityError;

        setRaffleTitle(activity.title);
        setWinners(activity.settings?.winners || []);

      } catch (error) {
        console.error('Error fetching results:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [activityId, supabase]);

  if (isLoading) {
    return <div className="text-center py-8">Cargando resultados...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Resultados del Sorteo: {raffleTitle}</h2>
      
      {winners.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {winners.map((winner, index) => (
              <li key={index} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 w-8 text-right">{index + 1}</span>
                  {winner.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={winner.avatar}
                      alt={winner.user}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">{winner.user?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                                              {winner.user || 'Ganador anónimo'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Premio: {winner.prize || 'No especificado'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay ganadores registrados aún para este sorteo.</p>
        </div>
      )}
    </div>
  );
};