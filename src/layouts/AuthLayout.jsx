import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isSignUp = pathname.endsWith('/sign-up');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Interactivos en Tiempo Real
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crea y participa en cuestionarios, sorteos, ruletas y votaciones
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSignUp ? (
            <SignUp
              path="/auth/sign-up"
              routing="path"
              signInUrl="/auth/sign-in"
              signUpFallbackRedirectUrl="/app/dashboard"
              signInFallbackRedirectUrl="/app/dashboard"
            />
          ) : (
            <SignIn
              path="/auth/sign-in"
              routing="path"
              signUpUrl="/auth/sign-up"
              signUpFallbackRedirectUrl="/app/dashboard"
              signInFallbackRedirectUrl="/app/dashboard"
            />
          )}
        </div>
      </div>
    </div>
  );
}
