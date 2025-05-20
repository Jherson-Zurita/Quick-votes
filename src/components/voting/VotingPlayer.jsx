import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useUser } from '@clerk/clerk-react';

export const VotingPlayer = ({ activityId }) => {
  const [voting, setVoting] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();
   const { user } = useUser();

  useEffect(() => {
    const fetchVoting = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (error) throw error;
        setVoting(data?.content || null);

        // Check if user already voted
        if (user) {
          const { data: participation, error: partError } = await supabase
            .from('participations')
            .select('responses')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

          if (!partError && participation?.responses?.selectedOptions) {
            setHasVoted(true);
            setSelectedOptions(participation.responses.selectedOptions);
          }
        }
      } catch (error) {
        console.error('Error fetching voting:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoting();
  }, [activityId, supabase, user]);

  const handleOptionToggle = (option) => {
    if (voting.isMultipleChoice) {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(item => item !== option) 
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const submitVote = async () => {
    if (selectedOptions.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('participations').upsert({
        activity_id: activityId,
        responses: { selectedOptions },
        updated_at: new Date().toISOString().replace('Z', '')
      }, {
        onConflict: 'activity_id,user_id',
      });

      if (error) throw error;
      setHasVoted(true);
    } catch (error) {
      console.error('Error submitting vote:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando votación...</div>;
  }

  if (!voting) {
    return <div className="text-center py-8">No se encontró la votación</div>;
  }

  return (
  <div className="max-w-md mx-auto space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-black mb-2">{voting.title}</h2>
      {voting.description && (
        <p className="text-black mb-4">{voting.description}</p>
      )}
    </div>

    {hasVoted ? (
      <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
        <p className="font-medium text-black">¡Ya has votado!</p>
        <p className="mt-1 text-black">Tu selección: {selectedOptions.join(', ')}</p>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="space-y-3">
          {voting.options.map((option, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors text-black ${
                selectedOptions.includes(option)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => handleOptionToggle(option)}
            >
              <div className="flex items-center">
                {voting.isMultipleChoice ? (
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                ) : (
                  <input
                    type="radio"
                    checked={selectedOptions.includes(option)}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                )}
                <span className="ml-3 text-black">{option}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={submitVote}
          disabled={selectedOptions.length === 0 || isLoading || !user}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!user ? 'Inicia sesión para votar' 
            : isLoading ? 'Enviando...' 
            : 'Enviar Voto'}
        </button>
      </div>
    )}
  </div>
);

};