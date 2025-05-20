// src/pages/ActivityPublic.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import ActivityCard from '../components/activities/ActivityCard';
import { useSupabase } from '../hooks/useSupabase';
import { getPublicActivities } from '../services/activityService';

export default function ActivityPublic() {
  const navigate = useNavigate();
  const { supabase, loading: supaLoading } = useSupabase();
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const data = await getPublicActivities(supabase);
        setActivities(data || []);
      } catch (err) {
        console.error(err);
        setError('Error cargando actividades públicas');
      }
    };
    loadPublic();
  }, [supabase]);

  if (supaLoading) return <Loader message="Cargando actividades públicas..." />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Actividades Públicas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(act => (
          <ActivityCard
            key={act.id}
            activity={act}
            onClick={() => navigate(`/join/${act.access_code}`)}
          />
        ))}
      </div>
      {activities.length === 0 && (
        <p className="text-gray-500 mt-4">No hay actividades públicas disponibles.</p>
      )}
    </div>
  );
}
