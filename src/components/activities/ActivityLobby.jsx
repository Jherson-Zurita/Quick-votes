import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Loader from "../../components/common/Loader";

const ActivityLobby = ({ 
  activity, 
  isOwner, 
  participations, 
  onStartActivity, 
  onFinishActivity,
  activityStatus,
  onNavigate
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Función para refrescar la lista de participantes
  const handleRefreshParticipants = async () => {
    setRefreshing(true);
    // Aquí se podría implementar una función para recargar los participantes
    // Por ahora usamos un timeout para simular la carga
    setTimeout(() => {
      setRefreshing(false);
      showToast("Lista de participantes actualizada", "success");
    }, 1000);
  };

  // Si no hay actividad, mostrar un loader
  if (!activity) {
    return <Loader message="Cargando detalles de la actividad..." />;
  }

  // Vista para el creador de la actividad
  if (isOwner) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Panel de control</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Participantes ({participations.length})</h3>
            <button
              onClick={handleRefreshParticipants}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              disabled={refreshing}
            >
              {refreshing ? (
                <span className="inline-block animate-spin mr-1">⟳</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Actualizar
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
            {participations.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                {participations.map((participation) => (
                  <li key={participation.id} className="py-2">
                    <span className="font-medium">{participation.username || participation.user_id.substring(0, 8)}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(participation.created_at).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                Aún no hay participantes. Comparte el código de la actividad para que otros se unan.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="font-semibold mb-1">Código de actividad:</h4>
            <div className="flex items-center">
              <span className="text-xl font-mono bg-white dark:bg-gray-600 px-3 py-1 rounded border dark:border-gray-500">
                {activity.id.substring(0, 8).toUpperCase()}
              </span>
              <button 
                className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                onClick={() => {
                  navigator.clipboard.writeText(activity.id.substring(0, 8).toUpperCase());
                  showToast("Código copiado al portapapeles", "success");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {activityStatus === "pending" && (
              <button
                onClick={onStartActivity}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                disabled={participations.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Iniciar actividad
              </button>
            )}
            
            {activityStatus === "started" && (
              <button
                onClick={onFinishActivity}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Finalizar actividad
              </button>
            )}
            
            {activityStatus === "ended" && (
              <div className="text-gray-600 dark:text-gray-300 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">
                Actividad finalizada
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Vista para los participantes
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 text-center">
      {activityStatus === "pending" ? (
        <>
          <div className="w-16 h-16 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Esperando al anfitrión</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            El anfitrión aún no ha iniciado esta actividad. Por favor, espera.
          </p>
          <div className="animate-bounce mt-4">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
          </div>
        </>
      ) : activityStatus === "ended" ? (
        <>
          <div className="w-16 h-16 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Actividad finalizada</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Esta actividad ha sido finalizada por el anfitrión. A continuación puedes ver los resultados.
          </p>
          <button
            onClick={() => onNavigate('results')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >           
            Ver resultados finales
        </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Actividad en curso</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ¡La actividad ha comenzado! Ya puedes participar.
          </p>
            <button
              onClick={() => onNavigate('play')} // Cambiar navigate por setTab
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Participar ahora
            </button>
        </>
      )}
    </div>
  );
};

export default ActivityLobby;