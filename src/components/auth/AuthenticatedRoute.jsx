import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Loader from '../common/Loader';

export default function AuthenticatedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/auth/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);
  
  if (!isLoaded) {
    return <Loader message="Verificando autenticación..." />;
  }
  
  if (!isSignedIn) {
    return null; // Ya manejamos la redirección en el useEffect
  }
  
  return <Outlet />;
}
