import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Quick votes
        </Link>

        {/* Navegación principal (desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">
            Inicio
          </Link>
          <SignedIn>
            <Link to="/app/dashboard" className="text-gray-700 hover:text-indigo-600">
              Dashboard
            </Link>
            <Link to="/app/create" className="text-gray-700 hover:text-indigo-600">
              Crear
            </Link>
          </SignedIn>
          <Link to="/join" className="text-gray-700 hover:text-indigo-600">
            Unirse
          </Link>
          <Link to="/app/activity/public" className="text-gray-700 hover:text-indigo-600">
            Actividades Públicas
          </Link>
        </nav>

        {/* Botones de autenticación / usuario */}
        <div className="flex items-center space-x-4">
          <SignedOut>
            <Link 
              to="/auth/sign-up" 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Regístrate
            </Link>
            <Link 
              to="/auth/sign-in" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Ingresar
            </Link>
          </SignedOut>

          <SignedIn>
            {/* Botón de perfil al lado del UserButton */}
            <Link 
              to="/app/profile" 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Mi Perfil
            </Link>

            {/* Botón de usuario de Clerk */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

