import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import ActivityCard from '../components/activities/ActivityCard';
import Loader from '../components/common/Loader';
import activityService from '../services/activityService';

const DashboardPage = () => {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const { showToast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [user?.id, supabase]);

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const actividades = await activityService.getUserActivities(supabase);
      setActivities(actividades);
      
    } catch (err) {
      console.error('Error in fetchActivities:', err);
      showToast('Error al cargar actividades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      try {
        await activityService.deleteActivity(supabase, activityId);
        setActivities(old => old.filter(a => a.id !== activityId));
        showToast('Actividad eliminada exitosamente', 'success');
      } catch (err) {
        console.error('Error deleting activity:', err);
        showToast('Error al eliminar la actividad', 'error');
      }
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities.filter(activity => activity.user_id === user?.id)
    : activities.filter(activity => activity.activity_type === filter && activity.user_id === user?.id);

  // Solo contar las actividades del usuario actual
  const userActivities = activities.filter(a => a.user_id === user?.id);
  const activityTypeCount = {
    quiz: userActivities.filter(a => a.activity_type === 'quiz').length,
    raffle: userActivities.filter(a => a.activity_type === 'raffle').length,
    wheel: userActivities.filter(a => a.activity_type === 'wheel').length,
    vote: userActivities.filter(a => a.activity_type === 'vote').length
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mi Dashboard
          </h1>
          <p className="text-gray-300">
            Gestiona tus actividades interactivas
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/app/create"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
          >
            <span className="mr-2">Nueva Actividad</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Estadísticas de todas las actividades del usuario */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Cuestionarios" count={activityTypeCount.quiz} type="quiz" setFilter={setFilter} currentFilter={filter} />
        <StatCard title="Sorteos" count={activityTypeCount.raffle} type="raffle" setFilter={setFilter} currentFilter={filter} />
        <StatCard title="Ruletas" count={activityTypeCount.wheel} type="wheel" setFilter={setFilter} currentFilter={filter} />
        <StatCard title="Votaciones" count={activityTypeCount.vote} type="vote" setFilter={setFilter} currentFilter={filter} />
      </div>

      {/* Filter Options */}
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
        <FilterButton label="Todos" value="all" currentFilter={filter} setFilter={setFilter} />
        <FilterButton label="Cuestionarios" value="quiz" currentFilter={filter} setFilter={setFilter} />
        <FilterButton label="Sorteos" value="raffle" currentFilter={filter} setFilter={setFilter} />
        <FilterButton label="Ruletas" value="wheel" currentFilter={filter} setFilter={setFilter} />
        <FilterButton label="Votaciones" value="vote" currentFilter={filter} setFilter={setFilter} />
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              onDelete={() => handleDeleteActivity(activity.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-500 rounded-lg bg-gray-800">
          <div className="text-gray-300 mb-4">
            {filter === 'all' ? (
              <p className="text-xl">No has creado ninguna actividad aún</p>
            ) : (
              <p className="text-xl">No tienes actividades de este tipo</p>
            )}
          </div>
          <Link
            to="/app/create"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
          >
            <span className="mr-2">Crear primera actividad</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

// Componentes auxiliares
const StatCard = ({ title, count, type, setFilter, currentFilter }) => (
  <div 
    className={`p-4 rounded-lg border cursor-pointer transition ${
      currentFilter === type 
        ? 'border-indigo-500 bg-indigo-900' 
        : 'border-gray-600 hover:bg-gray-700'
    }`}
    onClick={() => setFilter(type)}
  >
    <p className="text-sm text-white">{title}</p>
    <p className="text-2xl font-bold mt-1 text-white">{count}</p>
  </div>
);

const FilterButton = ({ label, value, currentFilter, setFilter }) => (
  <button
    className={`px-4 py-2 rounded-full font-medium text-sm transition ${
      currentFilter === value
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
    onClick={() => setFilter(value)}
  >
    {label}
  </button>
);

export default DashboardPage;