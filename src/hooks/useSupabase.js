import { useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { SupabaseContext } from '../context/SupabaseContext';
import { getAuthenticatedClient } from '../lib/supabase';

/**
 * Hook personalizado para acceder al cliente de Supabase autenticado con Clerk
 * @returns {Object} Cliente de Supabase autenticado y estado de carga
 */
export const useSupabase = () => {
  const { client: supabaseClient, setClient } = useContext(SupabaseContext);
  const { getToken, isSignedIn, userId, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeClient = async () => {
      if (isSignedIn && userId) {
        try {
          setLoading(true);
          const authenticatedClient = await getAuthenticatedClient(getToken);
          setClient(authenticatedClient);

        // Verificar si el perfil ya existe
        const { data: existingProfile, error: fetchError } = await authenticatedClient
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          console.error('Error verificando existencia del perfil:', fetchError);
        }

        if (!existingProfile) {
          // Si no existe, procede con la inserción
          const generateUsername = () => {
            const randomStr = Math.random().toString(36).substring(2, 7); // 5 caracteres aleatorios
            return `usuario_${randomStr}`;
          };  

          const profile = {
            user_id: userId,
            email: user?.emailAddresses?.[0]?.emailAddress || null,
            display_name: user?.fullName || user?.firstName || null,
            username: (user?.username ?? user?.emailAddresses?.[0]?.emailAddress.split('@')[0]) || generateUsername(),
            avatar_url: user?.imageUrl || "https://example.com/default-avatar.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await authenticatedClient
            .from('profiles')
            .insert(profile);

          if (upsertError) {
            console.error('Error insertando el perfil:', upsertError);
          }
        } else {
          console.log('El usuario ya tiene un perfil registrado, omitiendo inserción.');
        }
      } catch (error) {
        console.error('Error inicializando cliente de Supabase:', error);
      } finally {
         setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };


  initializeClient();
  }, [isSignedIn, userId, getToken, setClient]);

  return { supabase: supabaseClient, loading };
};

export default useSupabase;