import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../hooks/useSupabase";
import { useToast } from "../hooks/useToast";
import Loader from "../components/common/Loader";
import { createActivity } from "../services/activityService";

const ACTIVITY_TYPES = [
  { id: "quiz", name: "Cuestionario", icon: "📝", description: "Crea un cuestionario con preguntas y respuestas" },
  { id: "raffle", name: "Sorteo", icon: "🎁", description: "Organiza un sorteo entre participantes" },
  { id: "wheel", name: "Ruleta", icon: "🎯", description: "Crea una ruleta de decisiones aleatorias" },
  { id: "vote", name: "Votación", icon: "📊", description: "Organiza una votación entre diferentes opciones" }
];

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  //const supabase = useSupabase();
  const { supabase, loading } = useSupabase();
  const { showToast } = useToast();
  
  const [loadingg, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [activityData, setActivityData] = useState({
    title: "",
    description: "",
    is_public: true,
    expires_at: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActivityData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      showToast("Por favor selecciona un tipo de actividad", "error");
      return;
    }
    
    try {
      setLoading(true);
      const expiresISO = activityData.expires_at ? new Date(activityData.expires_at).toISOString(): null;
      
      const newActivity = {
        ...activityData,
        activity_type: selectedType.id,
        settings: {},
        state: 'pending',
        // Generar código de acceso aleatorio si la actividad no es pública
        access_code: !activityData.is_public ? Math.random().toString(36).substring(2, 8).toUpperCase() : null,
        expires_at: expiresISO,
      };
      
      
      const data = await createActivity(supabase, newActivity);
      console.log("Data:", data);


      showToast("Actividad creada con éxito", "success");
      
      // Redirigir al constructor específico basado en el tipo
      navigate(`/app/activity/${data.id}/build`);
      
    } catch (error) {
      console.error("Error al crear actividad:", error);
      showToast("Error al crear la actividad", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/dashboard");
  };

  if (loading) {
    return <Loader message="Creando actividad..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Actividad</h1>
      
      {!selectedType ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecciona un tipo de actividad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIVITY_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center mb-2">
                  <span className="text-4xl mr-3">{type.icon}</span>
                  <h3 className="text-xl font-medium">{type.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedType(null)}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Cambiar tipo
            </button>
            <div className="flex items-center ml-4">
              <span className="text-2xl mr-2">{selectedType.icon}</span>
              <h2 className="text-xl font-semibold">{selectedType.name}</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={activityData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder={`Título de tu ${selectedType.name.toLowerCase()}`}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="description" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={activityData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Describe el propósito de esta actividad"
                ></textarea>
              </div>
              
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-1 mb-4 md:mb-0">
                  <label 
                    htmlFor="expires_at" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Fecha de expiración (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    id="expires_at"
                    name="expires_at"
                    value={activityData.expires_at}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si no se establece, la actividad no expirará automáticamente.
                  </p>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visibilidad
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      name="is_public"
                      checked={activityData.is_public}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor="is_public" 
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {activityData.is_public ? "Pública" : "Privada (con código de acceso)"}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activityData.is_public 
                      ? "Cualquiera con el enlace puede acceder a la actividad." 
                      : "Solo quienes tengan el código de acceso podrán participar."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateActivityPage;