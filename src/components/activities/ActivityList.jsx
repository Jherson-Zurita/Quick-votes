import { useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { ActivityCard } from './ActivityCard';

export const ActivityList = ({ filter = 'all' }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('activities').select('*');

        if (filter === 'mine') {
          query = query.eq('user_id', supabase.auth.user()?.id);
        } else if (filter === 'public') {
          query = query.eq('is_public', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [filter, supabase]);

  if (isLoading) {
    return <div className="text-center py-8">Cargando actividades...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-8">No se encontraron actividades</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};