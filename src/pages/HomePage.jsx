import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const HomePage = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-6">
            Crea experiencias interactivas en tiempo real
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            Cuestionarios, sorteos, ruletas y votaciones para tus eventos, clases o reuniones
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isSignedIn ? (
              <Link
                to="/app/dashboard"
                className="px-8 py-3 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Mi Dashboard
              </Link>
            ) : (
              <Link
                to="/auth/sign-in"
                className="px-8 py-3 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Comenzar Ahora
              </Link>
            )}
            <Link
              to="/join"
              className="px-8 py-3 text-lg font-semibold border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
            >
              Unirse a una Actividad
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Cuatro maneras de interactuar con tu audiencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Cuestionarios"
              description="Crea quizzes interactivos para probar conocimientos o recopilar opiniones."
              icon="📝"
            />
            <FeatureCard
              title="Sorteos"
              description="Organiza rifas y sorteos en tiempo real entre los participantes."
              icon="🎁"
            />
            <FeatureCard
              title="Ruletas"
              description="Añade un elemento de azar con ruletas personalizables para decisiones o juegos."
              icon="🎡"
            />
            <FeatureCard
              title="Votaciones"
              description="Realiza votaciones en vivo y muestra resultados instantáneos."
              icon="🗳️"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Cómo funciona
          </h2>
          <div className="space-y-12">
            <Step
              number="1"
              title="Crea tu actividad"
              description="Elige entre cuestionarios, sorteos, ruletas o votaciones y configura según tus necesidades."
            />
            <Step
              number="2"
              title="Comparte con tu audiencia"
              description="Envía el código de acceso o un enlace directo a los participantes."
            />
            <Step
              number="3"
              title="Interactúen en tiempo real"
              description="Observa cómo los participantes interactúan y visualiza los resultados al instante."
            />
            <Step
              number="4"
              title="Analiza los resultados"
              description="Accede a estadísticas detalladas y exporta los datos para análisis posteriores."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 text-center bg-indigo-900 text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-10 text-indigo-100">
            Crea tu primera actividad interactiva en minutos
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isSignedIn ? (
              <Link
                to="/create"
                className="px-8 py-3 text-lg font-semibold bg-white text-indigo-900 rounded-lg hover:bg-indigo-100 transition"
              >
                Crear Actividad
              </Link>
            ) : (
              <Link
                to="/auth/sign-up"
                className="px-8 py-3 text-lg font-semibold bg-white text-indigo-900 rounded-lg hover:bg-indigo-100 transition"
              >
                Registrarse
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Componentes auxiliares
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 mr-6">
      <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-xl">
        {number}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default HomePage;