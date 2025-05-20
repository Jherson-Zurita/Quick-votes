import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-8xl font-extrabold text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </span>
        </h1>
        <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Página no encontrada
        </p>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 text-center rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            Ir al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-center rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            Volver atrás
          </button>
        </div>
      </div>
      
      <div className="mt-12">
        <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Si crees que esto es un error, por favor contacta al soporte.</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;