/**
 * Servicio para manejar las operaciones relacionadas con actividades
 */

import { generateAccessCode } from '../lib/utils';

/**
 * Obtener todas las actividades del usuario actual
 * @param {Object} supabase - Cliente de Supabase
 * @returns {Promise<Array>} Lista de actividades
 */
export const getUserActivities = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener actividades del usuario:', error);
    throw error;
  }
};

/**
 * Obtener una actividad por su ID
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @returns {Promise<Object>} Datos de la actividad
 */
export const getActivityById = async (supabase, activityId) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', activityId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener actividad por ID:', error);
    throw error;
  }
};

/**
 * Obtener una actividad por su código de acceso
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} accessCode - Código de acceso
 * @returns {Promise<Object>} Datos de la actividad
 */
export const getActivityByAccessCode = async (supabase, accessCode) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('access_code', accessCode.toUpperCase())
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al obtener actividad por código de acceso:', error);
    throw error;
  }
};

/**
 * Crear una nueva actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {Object} activity - Datos de la actividad
 * @returns {Promise<Object>} Actividad creada
 */
export const createActivity = async (supabase, activity) => {
  try {
    // Generar código de acceso único si no se proporciona uno
    if (!activity.access_code) {
      activity.access_code = generateAccessCode();
      
      // Verificar que el código sea único
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 5) {
        const { data } = await supabase
          .from('activities')
          .select('id')
          .eq('access_code', activity.access_code)
          .maybeSingle();
        
        if (!data) {
          isUnique = true;
        } else {
          activity.access_code = generateAccessCode();
          attempts++;
        }
      }
    }
    
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw error;
  }
};

/**
 * Actualizar una actividad existente
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Actividad actualizada
 */
export const updateActivity = async (supabase, activityId, updates) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    throw error;
  }
};

/**
 * Eliminar una actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @returns {Promise<void>}
 */
export const deleteActivity = async (supabase, activityId) => {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    throw error;
  }
};

/**
 * Obtener los elementos de una actividad
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @returns {Promise<Array>} Lista de elementos
 */
export const getActivityItems = async (supabase, activityId) => {
  try {
    const { data, error } = await supabase
      .from('activity_items')
      .select('*')
      .eq('activity_id', activityId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener elementos de la actividad:', error);
    throw error;
  }
};

/**
 * Guardar elementos de una actividad (crear o actualizar)
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} activityId - ID de la actividad
 * @param {Array} items - Lista de elementos
 * @returns {Promise<Array>} Lista de elementos guardados
 */
export const saveActivityItems = async (supabase, activityId, items) => {
  try {
    // Eliminar elementos existentes
    await supabase
      .from('activity_items')
      .delete()
      .eq('activity_id', activityId);
    
    // Añadir posición a los elementos si no la tienen
    const itemsWithPosition = items.map((item, index) => ({
      ...item,
      activity_id: activityId,
      position: item.position ?? index
    }));
    
    // Insertar nuevos elementos
    const { data, error } = await supabase
      .from('activity_items')
      .insert(itemsWithPosition)
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al guardar elementos de la actividad:', error);
    throw error;
  }
};

/**
 * Obtener actividades públicas
 * @param {Object} supabase - Cliente de Supabase
 * @param {number} limit - Límite de resultados (predeterminado: 10)
 * @param {number} page - Página de resultados (predeterminado: 0)
 * @returns {Promise<Array>} Lista de actividades públicas
 */
export const getPublicActivities = async (supabase, limit = 10, page = 0) => {
  try {
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener actividades públicas:', error);
    throw error;
  }
};

export default {
  getUserActivities,
  getActivityById,
  getActivityByAccessCode,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityItems,
  saveActivityItems,
  getPublicActivities
};