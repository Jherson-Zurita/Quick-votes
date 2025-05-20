/**
 * Servicio para manejar las operaciones relacionadas con los perfiles de usuario
 */

/**
 * Obtener el perfil de un usuario
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Datos del perfil
 */
export const getProfile = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};

/**
 * Crear un nuevo perfil de usuario
 * @param {Object} supabase - Cliente de Supabase
 * @param {Object} profile - Datos del perfil
 * @returns {Promise<Object>} Perfil creado
 */
export const createProfile = async (supabase, profile) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear el perfil:', error);
    throw error;
  }
};

/**
 * Actualizar un perfil de usuario existente
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} userId - ID del usuario
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async (supabase, userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
};

/**
 * Verificar si un nombre de usuario ya está en uso
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} username - Nombre de usuario a verificar
 * @returns {Promise<boolean>} true si el nombre de usuario está disponible
 */
export const isUsernameAvailable = async (supabase, username) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .maybeSingle();
    
    if (error) throw error;
    
    // Si no hay datos, el nombre de usuario está disponible
    return !data;
  } catch (error) {
    console.error('Error al verificar el nombre de usuario:', error);
    throw error;
  }
};

/**
 * Obtener el perfil o crearlo si no existe
 * @param {Object} supabase - Cliente de Supabase
 * @param {Object} userData - Datos del usuario desde Clerk
 * @returns {Promise<Object>} Perfil del usuario
 */
export const getOrCreateProfile = async (supabase, userData) => {
  try {
    const { id: userId, username, email_addresses, image_url } = userData;
    
    // Intentar obtener el perfil existente
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      return existingProfile;
    }
    
    // Crear un perfil si no existe
    const newProfile = {
      user_id: userId,
      username: username || email_addresses[0]?.email.split('@')[0] || `user_${userId.substring(0, 8)}`,
      display_name: username || email_addresses[0]?.email.split('@')[0] || 'Usuario',
      avatar_url: image_url || null
    };
    
    const { data: createdProfile, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (error) throw error;
    
    return createdProfile;
  } catch (error) {
    console.error('Error al obtener o crear perfil:', error);
    throw error;
  }
};

export default {
  getProfile,
  createProfile,
  updateProfile,
  isUsernameAvailable,
  getOrCreateProfile
};