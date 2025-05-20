import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../hooks/useSupabase';
import ConnectionTest from '../components/test/ConnectionTest';

export default function TestPage() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabase();

  useEffect(() => {
    // Comprobar si la función existe
    async function checkFunction() {
      try {
        const { data, error } = await supabase.rpc('create_test_messages_if_not_exists');
        if (error) {
          console.error('Error al verificar/crear la tabla de prueba:', error);
        } else {
          console.log('Tabla de prueba verificada/creada correctamente');
        }
      } catch (err) {
        console.error('Error en la llamada a la función:', err);
      }
    }
    
    checkFunction();
  }, [supabase]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Página de Prueba de Integración</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Estado de Autenticación con Clerk</h2>
        <div className="space-y-2">
          <p><strong>Cargado:</strong> {isLoaded ? 'Sí' : 'No'}</p>
          <p><strong>Sesión iniciada:</strong> {isSignedIn ? 'Sí' : 'No'}</p>
          {isSignedIn && user && (
            <div>
              <p><strong>ID de Usuario:</strong> {user.id}</p>
              <p><strong>Nombre:</strong> {user.fullName || user.firstName}</p>
              <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
              {user.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full mt-2"
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      {isSignedIn ? (
        <ConnectionTest />
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 text-yellow-700">Inicia sesión para probar la conexión</h2>
          <p className="text-yellow-600">
            Necesitas iniciar sesión con Clerk para probar la integración completa con Supabase.
          </p>
        </div>
      )}
    </div>
  );
}