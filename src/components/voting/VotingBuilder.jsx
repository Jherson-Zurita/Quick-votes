import { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

export const VotingBuilder = ({ activityId }) => {
  const [title, setTitle] = useState('Votación');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['Opción 1', 'Opción 2']);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const addOption = () => {
    setOptions([...options, `Opción ${options.length + 1}`]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // First delete existing items if any
      await supabase.from('activity_items').delete().eq('activity_id', activityId);

      // Insert new item
      const { error } = await supabase.from('activity_items').insert([{
        activity_id: activityId,
        content: {
          title,
          description,
          options,
          isMultipleChoice
        },
        position: 0
      }]);

      if (error) throw error;
      alert('Votación guardada exitosamente!');
      navigate(`/app/activity/${activityId}`);
    } catch (error) {
      console.error('Error saving voting:', error.message);
      alert('Error al guardar la votación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-medium text-lg text-black mb-4">Configuración de la Votación</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-1">
          Título de la votación
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isMultipleChoice"
          checked={isMultipleChoice}
          onChange={(e) => setIsMultipleChoice(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isMultipleChoice" className="ml-2 block text-sm text-black">
          Permitir selección múltiple
        </label>
      </div>
    </div>

    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-medium text-lg text-black mb-4">Opciones de Votación</h3>

      {options.map((option, index) => (
        <div key={index} className="mb-3 flex items-center space-x-2">
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
          />
          <button
            type="button"
            onClick={() => removeOption(index)}
            disabled={options.length <= 2}
            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
      >
        + Añadir opción
      </button>
    </div>

    <button
      type="button"
      onClick={handleSubmit}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
    >
      {isLoading ? 'Guardando...' : 'Guardar Votación'}
    </button>
  </div>
);

};