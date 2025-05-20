import { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

export const RaffleBuilder = ({ activityId }) => {
  const [title, setTitle] = useState('Sorteo');
  const [description, setDescription] = useState('');
  const [prizes, setPrizes] = useState([{ name: '', quantity: 1 }]);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const addPrize = () => {
    setPrizes([...prizes, { name: '', quantity: 1 }]);
  };

  const removePrize = (index) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const updatePrize = (index, field, value) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setPrizes(updatedPrizes);
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
          prizes,
          participants
        },
        position: 0
      }]);

      if (error) throw error;
      alert('Sorteo guardado exitosamente!');
      navigate(`/app/activity/${activityId}`);
    } catch (error) {
      console.error('Error saving raffle:', error.message);
      alert('Error al guardar el sorteo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-medium text-lg text-black mb-4">Configuración del Sorteo</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-1">
          Título del sorteo
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
    </div>

    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-medium text-lg text-black mb-4">Premios</h3>

      {prizes.map((prize, index) => (
        <div key={index} className="mb-4 p-3 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-black">Premio {index + 1}</span>
            <button
              type="button"
              onClick={() => removePrize(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Eliminar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-black mb-1">Nombre del premio</label>
              <input
                type="text"
                value={prize.name}
                onChange={(e) => updatePrize(index, 'name', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Cantidad disponible</label>
              <input
                type="number"
                min="1"
                value={prize.quantity}
                onChange={(e) => updatePrize(index, 'quantity', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPrize}
        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
      >
        + Añadir premio
      </button>
    </div>

    <button
      type="button"
      onClick={handleSubmit}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
    >
      {isLoading ? 'Guardando...' : 'Guardar Sorteo'}
    </button>
  </div>
);

};