import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import { useSupabase } from "../hooks/useSupabase";
import { useToast } from "../hooks/useToast";
import { getProfile, updateProfile, isUsernameAvailable } from "../services/profileService";

// Estructura inicial del perfil
const INITIAL_PROFILE_STATE = {
  username: "",
  display_name: "",
  avatar_url: "",
};

const ProfilePage = () => {
  const { user } = useUser();
  const {supabase }= useSupabase();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(INITIAL_PROFILE_STATE);
  const [usernameError, setUsernameError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await getProfile(supabase, user.id);
        
        if (data) {
          setProfile({
            username: data.username || "",
            display_name: data.display_name || user.fullName || "",
            avatar_url: data.avatar_url || user.imageUrl || "",
          });
          if (data.avatar_url) setAvatarPreview(data.avatar_url);
        } else {
          // Nuevo usuario - usar datos de Clerk
          const newProfile = {
            username: user.username || "",
            display_name: user.fullName || "",
            avatar_url: user.imageUrl || "",
          };
          setProfile(newProfile);
          if (user.imageUrl) setAvatarPreview(user.imageUrl);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        showToast("Error al cargar el perfil", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, supabase, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    
    // Actualizar preview del avatar si es la URL
    if (name === "avatar_url") {
      setAvatarPreview(value);
    }
    
    // Validar nombre de usuario en tiempo real
    if (name === "username") {
      validateUsername(value);
    }
  };

  const validateUsername = async (username) => {
    if (!username) {
      setUsernameError("El nombre de usuario es requerido");
      return false;
    }
    
    if (username.length < 3) {
      setUsernameError("Mínimo 3 caracteres");
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Solo letras, números y guiones bajos");
      return false;
    }
    
    try {
      const available = await isUsernameAvailable(supabase, username);
      if (!available && username !== profile.username) {
        setUsernameError("Nombre de usuario no disponible");
        return false;
      }
    } catch (error) {
      console.error("Error validando username:", error);
    }
    
    setUsernameError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación final
    const isUsernameValid = await validateUsername(profile.username);
    if (!isUsernameValid) return;
    
    try {
      setSaving(true);
      await updateProfile(supabase, user.id, profile);
      showToast("Perfil actualizado con éxito", "success");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      showToast("Error al actualizar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader message="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Perfil</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center mb-6 gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreview("")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.fullName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                  usernameError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="usuario123"
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
              />
              {usernameError && (
                <p className="mt-1 text-sm text-red-600">{usernameError}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="display_name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nombre para mostrar
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={profile.display_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Tu nombre público"
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="avatar_url" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                URL de avatar (opcional)
              </label>
              <input
                type="url"
                id="avatar_url"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="https://ejemplo.com/avatar.jpg"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Debe ser una URL válida de imagen (jpg, png, etc.)
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !!usernameError}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;