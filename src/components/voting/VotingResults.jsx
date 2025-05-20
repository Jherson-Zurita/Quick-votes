import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const VotingResults = ({ activityId }) => {
  const [votes, setVotes] = useState({});
  const [votingConfig, setVotingConfig] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get voting config
        const { data: activityItem, error: itemError } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (itemError) throw itemError;
        setVotingConfig(activityItem?.content || null);

        // Get all votes
        const { data: participations, error: partError } = await supabase
          .from('participations')
          .select('responses')
          .eq('activity_id', activityId);

        if (partError) throw partError;

        // Count votes
        const voteCounts = {};
        let total = 0;

        if (activityItem?.content?.options) {
          activityItem.content.options.forEach(option => {
            voteCounts[option] = 0;
          });

          participations.forEach(participation => {
            const selected = participation.responses?.selectedOptions || [];
            selected.forEach(option => {
              if (voteCounts[option] !== undefined) {
                voteCounts[option]++;
                total++;
              }
            });
          });
        }

        setVotes(voteCounts);
        setTotalVotes(total);
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

  if (!votingConfig) {
    return <div className="text-center py-8">No se encontró la votación</div>;
  }

  const chartData = {
    labels: Object.keys(votes),
    datasets: [
      {
        label: 'Votos',
        data: Object.values(votes),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Resultados de la Votación'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{votingConfig.title}</h2>
        {votingConfig.description && (
          <p className="text-gray-600 mb-4">{votingConfig.description}</p>
        )}
        <p className="text-lg font-medium">Total de votos: {totalVotes}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="space-y-3">
        {Object.entries(votes).map(([option, count]) => (
          <div key={option} className="p-3 border rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{option}</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{count} votos</span>
                <span className="text-indigo-600 font-medium">
                  {totalVotes > 0 ? `${Math.round((count / totalVotes) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
            {totalVotes > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${(count / totalVotes) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};