// src/components/ActivityBuildRouter.jsx
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useSupabase } from '../hooks/useSupabase';
import { getActivityById } from '../services/activityService';
import {QuizBuilder} from './quiz/QuizBuilder';
import {RaffleBuilder} from './raffle/RaffleBuilder';
import {WheelBuilder} from './wheel/WheelBuilder';
import {VotingBuilder} from './voting/VotingBuilder';

export default function ActivityBuildRouter() {
  const { activityId } = useParams();
  const { supabase, loading: supaLoading } = useSupabase();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivityById(supabase, activityId);
        if (!data) throw new Error('Actividad no encontrada');
        setActivity(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    if (activityId) load();
  }, [activityId, supabase]);

  if (supaLoading || (!activity && !error)) {
    return <Loader message="Cargando actividad..." />;
  }
  if (error) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Enrutar al builder correcto pasando activityId
  switch (activity.activity_type) {
    case 'quiz':
      return <QuizBuilder activityId={activityId} />;
    case 'raffle':
      return <RaffleBuilder activityId={activityId} />;
    case 'wheel':
      return <WheelBuilder activityId={activityId} />;
    case 'vote':
      return <VotingBuilder activityId={activityId} />;
    default:
      return (
        <div className="p-4 text-center">
          Tipo de actividad no soportado: {activity.activity_type}
        </div>
      );
  }
}