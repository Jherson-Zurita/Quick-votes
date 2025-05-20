import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// Crear el contexto para los toasts
const ToastContext = createContext(null);

/**
 * Componente Toast individual
 */
const Toast = ({ toast, onClose }) => {
  // Determinar el color de fondo según el tipo
  const getBgColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info':
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`${getBgColor()} text-white p-4 rounded-md shadow-lg mb-2 flex justify-between items-center`}
      role="alert"
    >
      <p>{toast.message}</p>
      <button 
        onClick={() => onClose(toast.id)} 
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Proveedor de contexto para los toasts
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Agregar un nuevo toast
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-eliminar el toast después de la duración especificada
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  // Eliminar un toast por su ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Métodos de conveniencia
  const showSuccess = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const showError = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const showInfo = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  const showWarning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);

  return (
    <ToastContext.Provider 
      value={{ 
        toasts, 
        addToast, 
        removeToast, 
        showSuccess, 
        showError, 
        showInfo, 
        showWarning 
      }}
    >
      {children}
      
      {/* Contenedor de toasts */}
      <div className="fixed top-4 right-4 z-50 max-w-md">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onClose={removeToast} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook para usar el contexto de toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

export default ToastProvider;