import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env.local');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener el token JWT de Clerk
export const getSupabaseToken = async (getToken) => {
  try {
    // Obtener el token JWT personalizado desde Clerk
    const token = await getToken({ template: 'supabase' });
    return token;
  } catch (error) {
    console.error('Error al obtener el token de Supabase:', error);
    return null;
  }
};

// Crear un cliente de Supabase autenticado con el token JWT de Clerk
export const getAuthenticatedClient = async (getToken) => {
  const token = await getSupabaseToken(getToken);
  
  if (!token) {
    console.error('No se pudo obtener el token de autenticación');
    return supabase; // Devuelve el cliente anónimo como fallback
  }
  
  // Crear un cliente autenticado con el token
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export default supabase;