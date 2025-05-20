/**
 * Servicio para manejar las operaciones relacionadas con las participaciones en actividades
 */

/**
 * Registrar una nueva participación en una actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {Object} participation - Datos de la participación
 * @returns {Promise<Object>} Participación creada
 */
export const createParticipation = async (supabase, participation) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .insert([participation])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear la participación:', error);
    throw error;
  }
};

/**
 * Actualizar una participación existente
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} participationId - ID de la participación
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Participación actualizada
 */
export const updateParticipation = async (supabase, participationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .update(updates)
      .eq('id', participationId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al actualizar la participación:', error);
    throw error;
  }
};

/**
 * Obtener participaciones de un usuario
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de participaciones
 */
export const getUserParticipations = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select(`
        *,
        activities:activity_id (
          id,
          title,
          activity_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener participaciones del usuario:', error);
    throw error;
  }
};

/**
 * Obtener participaciones para una actividad específica
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @returns {Promise<Array>} Lista de participaciones
 */
export const getActivityParticipations = async (supabase, activityId) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select(`
        *,
        profiles:user_id (
          user_id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('activity_id', activityId)
      .order('score', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener participaciones de la actividad:', error);
    throw error;
  }
};

/**
 * Verificar si un usuario ya ha participado en una actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} true si el usuario ya ha participado
 */
export const hasUserParticipated = async (supabase, activityId, userId) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error al verificar participación del usuario:', error);
    throw error;
  }
};

/**
 * Obtener el tablero de clasificación para una actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @param {number} limit - Límite de resultados (predeterminado: 10)
 * @returns {Promise<Array>} Tablero de clasificación
 */
export const getLeaderboard = async (supabase, activityId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        activity_id,
        user_id,
        score,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('activity_id', activityId)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener el tablero de clasificación:', error);
    throw error;
  }
};

/**
 * Obtener una participación específica
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} participationId - ID de la participación
 * @returns {Promise<Object>} Datos de la participación
 */
export const getParticipation = async (supabase, participationId) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('id', participationId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener la participación:', error);
    throw error;
  }
};

/**
 * Eliminar una participación
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} participationId - ID de la participación
 * @returns {Promise<void>}
 */
export const deleteParticipation = async (supabase, participationId) => {
  try {
    const { error } = await supabase
      .from('participations')
      .delete()
      .eq('id', participationId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar la participación:', error);
    throw error;
  }
};

export const getParticipationsByActivityId = async (supabase, activityId) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('activity_id', activityId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener participaciones por ID de actividad:', error);
    throw error;
  }
}

export default {
  createParticipation,
  updateParticipation,
  getUserParticipations,
  getActivityParticipations,
  hasUserParticipated,
  getLeaderboard,
  getParticipation,
  deleteParticipation
};