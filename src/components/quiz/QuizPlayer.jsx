import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useUser } from '@clerk/clerk-react';
import Loader from '../common/Loader';

export const QuizPlayer = ({ activityId, className = '' }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);
  const { supabase } = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    const fetchQuizAndCheckAttempts = async () => {
      setIsLoading(true);
      try {
        // Primero verificamos si el usuario ya ha respondido este cuestionario
        if (user) {
          const { data: participationData, error: participationError } = await supabase
            .from('participations')
            .select('*')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

          if (participationError && participationError.code !== 'PGRST116') {
            console.error('Error checking participation:', participationError);
          }

          if (participationData) {
            setHasAttempted(true);
            setPreviousScore(participationData.score || 0);
          }
        }

        // Cargamos el cuestionario de la actividad
        const { data: activityData, error: activityError } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (activityError) throw activityError;
        
        if (activityData?.content?.questions && Array.isArray(activityData.content.questions)) {
          // Formato nuevo - todas las preguntas están en content.questions
          const validatedQuestions = activityData.content.questions.map(q => ({
            question: q.question || 'Pregunta sin texto',
            options: q.options || [],
            correctAnswer: q.correctAnswer ?? 0
          }));
          
          setQuestions(validatedQuestions);
        } else {
          // Formato antiguo - intentamos cargar de activity_items
          console.warn('Formato de cuestionario antiguo detectado, intentando cargar desde activity_items');
          
          const { data: itemsData, error: itemsError } = await supabase
            .from('activity_items')
            .select('content')
            .eq('activity_id', activityId)
            .order('position', { ascending: true });

          if (itemsError) throw itemsError;

          if (itemsData && itemsData.length > 0) {
            const oldFormatQuestions = itemsData.map(item => ({
              question: item.content?.question || 'Pregunta sin texto',
              options: item.content?.options || [],
              correctAnswer: item.content?.correctAnswer ?? 0
            }));
            
            setQuestions(oldFormatQuestions);
          } else {
            // No hay preguntas en ninguno de los dos formatos
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error('Error loading quiz data:', err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizAndCheckAttempts();
  }, [activityId, supabase, user]);

  useEffect(() => {
    if (isFinished && user) {
      const saveResults = async () => {
        try {
          // Guardamos las respuestas del usuario
          const userResponses = questions.map((q, i) => {
            // Solo incluimos la respuesta si el usuario llegó a esa pregunta
            if (i <= currentQuestion) {
              return {
                question: q.question,
                selectedAnswer: selectedOption !== null && i === currentQuestion ? 
                  q.options[selectedOption] : 
                  null
              };
            }
            return null;
          }).filter(Boolean); // Eliminamos las respuestas nulas
          
          const finalScore = (score / questions.length) * 100;
          
          await supabase
            .from('participations')
            .upsert({
              activity_id: activityId,
              user_id: user.id,
              responses: userResponses,
              score: finalScore,
              updated_at: new Date().toISOString()
            }, { onConflict: 'activity_id,user_id' });
        } catch (err) {
          console.error('Error saving results:', err);
        }
      };
      saveResults();
    }
  }, [isFinished, questions, score, activityId, supabase, user, currentQuestion, selectedOption]);

  const handleOptionSelect = index => setSelectedOption(index);

  const handleNext = () => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) return <Loader />;
  if (!questions.length) return <div className="text-center py-8 text-black">No hay preguntas disponibles</div>;

  // Si el usuario ya ha intentado este cuestionario y obtuvo más de 0 puntos, mostramos un mensaje
  if (hasAttempted && previousScore > 0) {
    return (
      <div className={`w-full p-6 bg-white rounded-lg shadow-md text-center ${className}`}>
        <h2 className="text-2xl font-bold text-black mb-4">Cuestionario ya completado</h2>
        <p className="text-lg text-black mb-2">Ya has respondido este cuestionario anteriormente.</p>
        <p className="text-lg text-black mb-4">Tu puntuación: {previousScore.toFixed(1)}%</p>
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver a Actividades
          </button>
        </div>
      </div>
    );
  }
  
  // Si el usuario obtuvo 0 puntos en un intento anterior, le permitimos volver a intentarlo
  if (hasAttempted && previousScore === 0) {
    return (
      <div className={`w-full p-6 bg-white rounded-lg shadow-md text-center ${className}`}>
        <h2 className="text-2xl font-bold text-black mb-4">Intento Anterior</h2>
        <p className="text-lg text-black mb-2">Tu puntuación anterior fue de 0%.</p>
        <p className="text-lg text-black mb-4">Puedes volver a intentarlo para mejorar tu resultado.</p>
        <div className="flex justify-center mt-6 space-x-3">
          <button 
            onClick={() => {
              setHasAttempted(false);
              setCurrentQuestion(0);
              setSelectedOption(null);
              setScore(0);
              setIsFinished(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar Nuevamente
          </button>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver a Actividades
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className={`w-full p-6 bg-white rounded-lg shadow-md text-center ${className}`}>      
        <h2 className="text-2xl font-bold text-black mb-4">¡Cuestionario Completado!</h2>
        <p className="text-lg text-black mb-2">Tu puntuación: {score}/{questions.length}</p>
        <p className="text-lg text-black mb-4">{percentage.toFixed(1)}%</p>
        <div className="flex justify-center mt-6 space-x-2">
          <button onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver a Actividades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 bg-white rounded-lg shadow-md ${className}`}>      
      <div className="mb-4">
        <span className="text-sm text-black">
          Pregunta {currentQuestion + 1} de {questions.length}
        </span>
        <h2 className="text-xl font-semibold text-black mt-1">{q.question}</h2>
      </div>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleOptionSelect(i)}
            className={`w-full text-left p-3 rounded-md border text-black ${
              selectedOption === i ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button onClick={handleNext} disabled={selectedOption === null}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
      </button>
    </div>
  );
};
