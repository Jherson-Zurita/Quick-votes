import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para capturar errores en la aplicación
 * y mostrar un mensaje de error amigable
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También podríamos registrar el error en un servicio de reporte de errores
    this.setState({
      error,
      errorInfo
    });
    
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">¡Oops! Algo salió mal</h2>
            
            <p className="mb-4 text-gray-700">
              Ha ocurrido un error inesperado en la aplicación. Puedes intentar:
            </p>
            
            <ul className="list-disc ml-5 mb-6 text-gray-700">
              <li>Recargar la página</li>
              <li>Volver a la página principal</li>
              <li>Intentar de nuevo más tarde</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Recargar página
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Ir al inicio
              </button>
            </div>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto">
                <details>
                  <summary className="font-medium cursor-pointer mb-2">Detalles del error (solo desarrollo)</summary>
                  <p className="text-red-600 mb-2">{this.state.error?.toString()}</p>
                  <pre className="text-xs whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los hijos normalmente
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;