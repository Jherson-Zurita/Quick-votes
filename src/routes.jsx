import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Rutas públicas
import HomePage from './pages/HomePage';
import JoinActivityPage from './pages/JoinActivityPage';
import NotFoundPage from './pages/NotFoundPage';
import TestPage from './pages/TestPage';

// Rutas autenticadas
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateActivityPage from './pages/CreateActivityPage';
import ActivityDetailsPage from './pages/ActivityDetailsPage';
import ResultsPage from './pages/ResultsPage';
import ActivityPublic from './pages/ActivityPublic';
import ActivityBuildRouter from './components/ActivityBuildRouter';
import ContactInfo from './pages/ContactInfo';

// Componentes de protección de rutas
import AuthenticatedRoute from './components/auth/AuthenticatedRoute';
import UnauthenticatedRoute from './components/auth/UnauthenticatedRoute';

/**
 * Configuración de rutas para React Router
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'join/:accessCode?',
        element: <JoinActivityPage />
      },
      {
        path: 'contact',
        element: <ContactInfo />
      },
      {
        path: 'test',
        element: <TestPage />
      },
      {
        path: 'app',
        element: <AuthenticatedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'profile',
            element: <ProfilePage />
          },
          {
            path: 'create',
            element: <CreateActivityPage />
          },
          {
            path: 'activity/:activityId',
            element: <ActivityDetailsPage />
          },
          { path: 'activity/:activityId/build',
            element: <ActivityBuildRouter />
          },
          {
            path: 'results/:activityId',
            element: <ResultsPage />
          },
          {
            path: 'activity/public',
            element: <ActivityPublic />
          }

        ]
      },
      {
        path: 'auth',
        element: <UnauthenticatedRoute />,
        children: [
          {
            path: '*',
            element: <AuthLayout />
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export default router;