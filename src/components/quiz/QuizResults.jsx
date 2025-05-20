import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';

export const QuizResults = ({ activityId }) => {
  const [participations, setParticipations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // --- CARGAR PREGUNTAS ---
        // Intentamos primero el formato "nuevo" (un solo item con content.questions)
        const { data: newFormat, error: newErr } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (newErr && newErr.code !== 'PGRST116') throw newErr;

        let formattedQuestions = [];

        if (newFormat?.content?.questions && Array.isArray(newFormat.content.questions)) {
          // Formato nuevo
          formattedQuestions = newFormat.content.questions.map((q, idx) => ({
            question: q.question || 'Pregunta sin texto',
            options: q.options || [],
            position: idx
          }));
        } else {
          // Formato antiguo: múltiples filas en activity_items
          const { data: oldItems, error: oldErr } = await supabase
            .from('activity_items')
            .select('content, position')
            .eq('activity_id', activityId)
            .order('position', { ascending: true });

          if (oldErr) throw oldErr;

          formattedQuestions = (oldItems || []).map(item => ({
            question: item.content?.question || 'Pregunta sin texto',
            options: item.content?.options || [],
            position: item.position
          }));
        }

        setQuestions(formattedQuestions);

        // --- CARGAR PARTICIPACIONES ---
        const { data: parts, error: partsErr } = await supabase
          .from('participations')
          .select(`
            *,
            profiles:user_id ( username, avatar_url )
          `)
          .eq('activity_id', activityId)
          .order('score', { ascending: false });

        if (partsErr) throw partsErr;
        setParticipations(parts || []);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activityId, supabase]);

  const handleParticipationSelect = (participation) => {
    setSelectedParticipation(participation);
    setExpandedView(true);
  };

  // -- Loader --
  if (isLoading) {
    return <div className="text-center py-8">Cargando resultados...</div>;
  }

  // -- Sin participaciones --
  if (!participations.length) {
    return <div className="text-center py-8 text-black">No hay participaciones aún</div>;
  }

  // -- Vista expandida de una participación única --
  if (expandedView && selectedParticipation) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            Respuestas de {selectedParticipation.profiles?.username || 'Usuario desconocido'}
          </h2>
          <button
            onClick={() => setExpandedView(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver a la lista
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <p className="text-black">
              Fecha: {new Date(selectedParticipation.created_at).toLocaleDateString()}
            </p>
            <p className="text-black">
              Hora: {new Date(selectedParticipation.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="space-y-8 mt-6">
          {questions.map((question, idx) => {
            const userResponse = selectedParticipation.responses?.find(
              (r) => r.question === question.question
            );

            return (
              <div key={idx} className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-medium mb-2 text-black">
                  Pregunta {idx + 1}: {question.question}
                </h3>
                <div className="ml-4 mt-3">
                  <p className="font-medium text-black">Opciones:</p>
                  <ul className="list-disc ml-6 mt-1 space-y-1 text-black">
                    {question.options.map((opt, optIdx) => (
                      <li key={optIdx}>{opt}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <p className="font-medium text-black">Respuesta del participante:</p>
                    {userResponse?.selectedAnswer ? (
                      <p className="mt-1 ml-6 text-black">{userResponse.selectedAnswer}</p>
                    ) : (
                      <p className="mt-1 ml-6 text-gray-500">Sin respuesta</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- Lista compacta de participaciones --
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black text-center mb-6">
        Resultados del Cuestionario
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {participations.map((p, idx) => (
            <li
              key={p.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleParticipationSelect(p)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-black w-8 text-right">{idx + 1}</span>
                <div className="flex-shrink-0">
                  {p.profiles?.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={p.profiles.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-black">
                        {p.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {p.profiles?.username || 'Usuario desconocido'}
                  </p>
                  <p className="text-sm text-black truncate">
                    Participó el {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-1 text-sm text-black truncate">
                  {p.responses && p.responses.length > 0 ? (
                    <div className="truncate">
                      <span className="font-medium text-black">Respuestas:</span>{' '}
                      {p.responses.map((resp, ridx) => (
                        <span key={ridx}>
                          P{ridx + 1}: {resp.selectedAnswer || 'No respondida'}
                          {ridx < p.responses.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-black">Sin respuestas registradas</span>
                  )}
                </div>
                <div className="text-sm text-blue-500 whitespace-nowrap">
                  Ver completo →
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
