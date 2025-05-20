import { createContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import PropTypes from 'prop-types';

// Crear el contexto
export const SupabaseContext = createContext(null);

/**
 * Proveedor de contexto para Supabase
 * Permite compartir el cliente de Supabase autenticado en toda la aplicación
 */
export const SupabaseProvider = ({ children }) => {
  // Inicialmente usamos el cliente anónimo
  const [client, setClient] = useState(supabase);

  return (
    <SupabaseContext.Provider value={{ client, setClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// PropTypes
SupabaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SupabaseProvider;