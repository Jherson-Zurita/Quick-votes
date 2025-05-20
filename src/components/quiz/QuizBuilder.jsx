import { useState, useEffect } from 'react';
import useSupabase from '../../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

export const QuizBuilder = ({ activityId }) => {
  const [questions, setQuestions] = useState([
    { question: '', options: ['', ''], correctAnswer: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  // Cargar cuestionario existente si lo hay
  useEffect(() => {
    const fetchExistingQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_items')
          .select('content')
          .eq('activity_id', activityId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Si existe contenido previo, cargarlo
        if (data && data.content && data.content.questions) {
          setQuestions(data.content.questions);
          setExistingQuiz(data.content);
        }
      } catch (err) {
        console.error('Error al cargar cuestionario existente:', err);
      }
    };

    fetchExistingQuiz();
  }, [activityId, supabase]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      // Adjust correct answer if needed
      if (updatedQuestions[questionIndex].correctAnswer >= optionIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(
          0,
          updatedQuestions[questionIndex].correctAnswer - 1
        );
      }
      setQuestions(updatedQuestions);
    }
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateQuestions = () => {
    // Verificar que todas las preguntas tengan texto
    const hasEmptyQuestions = questions.some(q => !q.question.trim());
    if (hasEmptyQuestions) {
      alert('Todas las preguntas deben tener texto');
      return false;
    }

    // Verificar que todas las opciones tengan texto
    const hasEmptyOptions = questions.some(q => 
      q.options.some(opt => !opt.trim())
    );
    if (hasEmptyOptions) {
      alert('Todas las opciones deben tener texto');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuestions()) return;
    
    setIsLoading(true);
    const quizContent = {
      type: 'quiz',
      questions,
      settings: {
        allowMultipleAttempts: false,
        showCorrectAnswers: false,
        ...existingQuiz?.settings
      },
      created_at: existingQuiz?.created_at || new Date().toISOString()
    };
    try {
      let result;
      if (existingQuiz) {
        // ACTUALIZAR
        result = await supabase
          .from('activity_items')
          .update({ content: quizContent })
          .eq('activity_id', activityId);
      } else {
        // INSERTAR
        result = await supabase
          .from('activity_items')
          .insert([{
            activity_id: activityId,
            content: quizContent,
            position: 0
          }]);
      }

      if (result.error) throw error;
      
      alert('Cuestionario guardado exitosamente!');
      navigate(`/app/activity/${activityId}`);
    } catch (error) {
      console.error('Error saving quiz:', error.message);
      alert('Error al guardar el cuestionario: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateOption = (questionIndex, optionIndex) => {
    // Validación básica para opciones
    const option = questions[questionIndex].options[optionIndex];
    return option.trim() !== '';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Crear Cuestionario</h2>
      
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="p-4 border rounded-md bg-white shadow-sm mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-base">Pregunta {qIndex + 1}</h3>
            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Eliminar
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pregunta
            </label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-black"
              placeholder="Escribe la pregunta"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opciones (selecciona la correcta)
            </label>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correctAnswer-${qIndex}`}
                    checked={question.correctAnswer === oIndex}
                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className={`flex-1 rounded-md border shadow-sm p-2 text-black ${
                      validateOption(qIndex, oIndex) ? 'border-gray-300' : 'border-red-300'
                    }`}
                    placeholder={`Opción ${oIndex + 1}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Añadir opción
            </button>
          </div>
        </div>
      ))}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Añadir pregunta
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cuestionario'}
        </button>
      </div>
    </div>
  );
};