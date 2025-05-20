import { useState, useEffect } from 'react';
import { useUser, useSession } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

// Componente para probar la conexión entre Clerk y Supabase
export default function ConnectionTest() {
  const { user } = useUser();
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Crear cliente Supabase con autenticación de Clerk
  const createClerkSupabaseClient = () => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({ template: 'supabase' });
            
            const headers = new Headers(options?.headers);
            headers.set('Authorization', `Bearer ${clerkToken}`);
            
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );
  };

  // Obtener perfil del usuario
  useEffect(() => {
    if (!user || !session) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabase = createClerkSupabaseClient();

        // Intentar obtener el perfil
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Si hay un error o no hay perfil, crearlo
        if (error || !data) {
          // Crear perfil si no existe
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              username: user.username || `user_${user.id.substring(0, 8)}`,
              display_name: user.fullName || user.firstName,
              avatar_url: user.imageUrl
            })
            .select()
            .single();

          if (createError) throw createError;
          data = newProfile;
        }

        setProfile(data);
        
        // Cargar mensajes de prueba
        const { data: messagesData } = await supabase
          .from('test_messages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (messagesData) {
          setMessages(messagesData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, session]);

  // Manejar envío de mensaje de prueba
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testMessage.trim()) return;
    
    try {
      const supabase = createClerkSupabaseClient();
      
      // Crear tabla test_messages si no existe
      await supabase.rpc('create_test_messages_if_not_exists');
      
      // Insertar mensaje
      const { error } = await supabase
        .from('test_messages')
        .insert({
          content: testMessage,
          user_id: user.id
        });
      
      if (error) throw error;
      
      // Recargar mensajes
      const { data } = await supabase
        .from('test_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      setMessages(data || []);
      setTestMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  
  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-md">
      Error: {error}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Conexión</h1>
      
      {profile && (
        <div className="bg-green-100 p-4 rounded-md mb-4">
          <h2 className="font-bold text-green-800">¡Conexión exitosa!</h2>
          <p>Perfil creado/encontrado en Supabase:</p>
          <pre className="bg-green-50 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Probar escritura/lectura:</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Escribe un mensaje de prueba"
            className="w-full p-2 border rounded"
          />
          <button 
            type="submit" 
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
            disabled={!testMessage.trim()}
          >
            Enviar
          </button>
        </form>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Mensajes:</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500">No hay mensajes aún.</p>
          ) : (
            <ul className="border rounded-md divide-y">
              {messages.map((msg) => (
                <li key={msg.id} className="p-3">
                  {msg.content}
                  <span className="block text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}