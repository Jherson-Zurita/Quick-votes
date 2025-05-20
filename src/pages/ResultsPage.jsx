import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../hooks/useSupabase";
import { useToast } from "../hooks/useToast";
import Loader from "../components/common/Loader";
import { getActivityById } from "../services/activityService";
import {getParticipationsByActivityId} from "../services/participationService";

const ResultsPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { supabase: supabaseClient } = useSupabase();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterText, setFilterText] = useState('');
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Cargar datos de la actividad
        const activityData = await getActivityById(supabaseClient, activityId);
        
        if (!activityData) {
          setError("Actividad no encontrada");
          return;
        }
        
        setActivity(activityData);
        
        // Verificar si el usuario es el propietario
        if (user && activityData.user_id === user.id) {
          setIsOwner(true);
        } else if (!activityData.is_public) {
          // Si no es el propietario y la actividad es privada, verificar si el usuario ha participado
          // Esto se podría implementar con una consulta adicional
        }
        
        // Cargar participaciones
        const participationsData = await getParticipationsByActivityId(supabaseClient, activityId);
        setParticipations(participationsData || []);
        
      } catch (error) {
        console.error("Error cargando resultados:", error);
        setError("Error al cargar los resultados");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [activityId, supabaseClient, user]);
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedParticipations = () => {
    if (!participations || participations.length === 0) return [];
    
    const filteredData = filterText.trim() === '' 
      ? [...participations] 
      : participations.filter(p => 
          p.username?.toLowerCase().includes(filterText.toLowerCase()) ||
          p.user_id?.toLowerCase().includes(filterText.toLowerCase())
        );
    
    return filteredData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  const handleBackToActivity = () => {
    navigate(`/app/activity/${activityId}`);
  };
  
  const handleDownloadResults = () => {
    if (!participations || participations.length === 0) {
      showToast("No hay resultados para descargar", "error");
      return;
    }
    
    // Crear un CSV a partir de los datos
    const headers = ["Usuario", "Puntuación", "Fecha", "Respuestas"];
    const csvContent = [
      headers.join(","),
      ...participations.map(p => {
        const username = p.username || p.user_id.substring(0, 8);
        const score = p.score || 0;
        const date = new Date(p.created_at).toLocaleDateString();
        const responses = JSON.stringify(p.responses || {});
        return [username, score, date, `"${responses}"`].join(",");
      })
    ].join("\n");
    
    // Crear un blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `resultados_${activity.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getActivityTypeIcon = (type) => {
    switch (type) {
      case "quiz": return "📝";
      case "raffle": return "🎁";
      case "wheel": return "🎯";
      case "vote": return "📊";
      default: return "📄";
    }
  };
  
  if (loading) {
    return <Loader message="Cargando resultados..." />;
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => navigate("/app/dashboard")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!activity) return null;
  
  const sortedParticipations = getSortedParticipations();
  
  // Mostrar diferentes vistas según el tipo de actividad
  const renderResultsByType = () => {
    switch (activity.activity_type) {
      case "quiz":
        return renderQuizResults();
      case "vote":
        return renderVoteResults();
      case "raffle":
        return renderRaffleResults();
      case "wheel":
        return renderWheelResults();
      default:
        return renderDefaultResults();
    }
  };
  
  const renderQuizResults = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Resultados del Cuestionario</h3>
        
        {sortedParticipations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left" onClick={() => handleSort('username')}>
                    Usuario {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4 text-left" onClick={() => handleSort('score')}>
                    Puntuación {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4 text-left" onClick={() => handleSort('created_at')}>
                    Fecha {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipations.map((participation, index) => (
                  <tr 
                    key={participation.id} 
                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                  >
                    <td className="py-3 px-4">{participation.username || participation.user_id.substring(0, 8)}</td>
                    <td className="py-3 px-4">{participation.score || 0}</td>
                    <td className="py-3 px-4">{new Date(participation.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => {
                          // Aquí se podría abrir un modal con detalles de las respuestas
                          console.log(participation.responses);
                        }}
                      >
                        Ver respuestas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aún no hay participaciones registradas.</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderVoteResults = () => {
    // Aquí se podría implementar una visualización de los resultados de votación
    // Por ejemplo, un gráfico de barras
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Resultados de la Votación</h3>
        
        {sortedParticipations.length > 0 ? (
          <div>
            <p className="mb-4">Total de votos: {sortedParticipations.length}</p>
            
            {/* Aquí se podría implementar un gráfico o visualización */}
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-center">Visualización de resultados</p>
            </div>
            
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Usuario</th>
                    <th className="py-3 px-4 text-left">Voto</th>
                    <th className="py-3 px-4 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipations.map((participation, index) => (
                    <tr 
                      key={participation.id} 
                      className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                    >
                      <td className="py-3 px-4">{participation.username || participation.user_id.substring(0, 8)}</td>
                      <td className="py-3 px-4">{JSON.stringify(participation.responses)}</td>
                      <td className="py-3 px-4">{new Date(participation.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aún no hay votos registrados.</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderRaffleResults = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Resultados del Sorteo</h3>
        
        {sortedParticipations.length > 0 ? (
          <div>
            <p className="mb-4">Participantes: {sortedParticipations.length}</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Usuario</th>
                    <th className="py-3 px-4 text-left">Fecha de participación</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipations.map((participation, index) => (
                    <tr 
                      key={participation.id} 
                      className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                    >
                      <td className="py-3 px-4">{participation.username || participation.user_id.substring(0, 8)}</td>
                      <td className="py-3 px-4">{new Date(participation.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {participation.winner ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">Ganador</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Participante</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => {
                  // Aquí se podría implementar la lógica para realizar el sorteo
                  showToast("Funcionalidad de sorteo aún no implementada", "info");
                }}
              >
                Realizar sorteo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aún no hay participantes registrados.</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderWheelResults = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Historial de la Ruleta</h3>
        
        {sortedParticipations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Usuario</th>
                  <th className="py-3 px-4 text-left">Resultado</th>
                  <th className="py-3 px-4 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipations.map((participation, index) => (
                  <tr 
                    key={participation.id} 
                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                  >
                    <td className="py-3 px-4">{participation.username || participation.user_id.substring(0, 8)}</td>
                    <td className="py-3 px-4">{participation.responses?.result || "No disponible"}</td>
                    <td className="py-3 px-4">{new Date(participation.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aún no hay resultados registrados.</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderDefaultResults = () => {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Tipo de actividad no reconocido o no se han implementado los resultados para este tipo.
        </p>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <span className="mr-2">{getActivityTypeIcon(activity.activity_type)}</span>
          Resultados: {activity.title}
        </h1>
        
        <button
          onClick={handleBackToActivity}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Participaciones:</span> {participations.length}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar participante..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full md:w-56 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <button
              onClick={handleDownloadResults}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Descargar CSV
            </button>
          </div>
        </div>
        
        {renderResultsByType()}
      </div>
    </div>
  );
};

export default ResultsPage;