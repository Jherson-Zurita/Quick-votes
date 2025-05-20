import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUser } from '@clerk/clerk-react';

const ActivityCard = ({ activity, onDelete }) => {
  const { id, title, activity_type, is_public, created_at, access_code, user_id, state } = activity;
  const { user } = useUser();
  const navigate = useNavigate();

  // Determinar detalles según el tipo de actividad
  const getActivityTypeDetails = () => {
    switch (activity_type) {
      case 'quiz': return { icon: '📝', label: 'Cuestionario', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'raffle': return { icon: '🎁', label: 'Sorteo', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'wheel': return { icon: '🎡', label: 'Ruleta', bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
      case 'vote': return { icon: '🗳️', label: 'Votación', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      default: return { icon: '📊', label: 'Actividad', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Determinar detalles del estado de la actividad
  const getStateDetails = () => {
    switch (state) {
      case 'pending': return { label: 'Pendiente', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
      case 'started': return { label: 'En progreso', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'ended': return { label: 'Finalizada', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      default: return { label: state, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const { icon, label, bgColor, textColor } = getActivityTypeDetails();
  const { label: stateLabel, bgColor: stateBg, textColor: stateText } = getStateDetails();
  const timeAgo = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: es }) : '';

  const isOwner = user?.id === user_id;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <span className="mr-1">{icon}</span>{label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stateBg} ${stateText}`}>
            {stateLabel}
          </span>
          <div className="flex items-center">
            {is_public ? (
              <span className="inline-flex items-center text-xs text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Público
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Privado
              </span>
            )}
          </div>
        </div>

        <Link to={isOwner ? `/app/activity/${id}` : `/join/${access_code || ''}`}>
          <h3 className="text-lg font-semibold text-white mb-2 hover:text-indigo-600">{title}</h3>
        </Link>

        <div className="text-xs text-gray-500 mb-4">Creado {timeAgo}</div>

        <div className="flex mt-4 space-x-2">
          {isOwner ? (
            <>  
              <Link to={`/app/activity/${id}`} className="flex-1 px-4 py-2 text-sm text-center font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition">Ver</Link>
              <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition">Eliminar</button>
            </>
          ) : (
            <button onClick={() => navigate(`/join/${access_code}`)} className="flex-1 px-4 py-2 text-sm text-center font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">Unirse</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
