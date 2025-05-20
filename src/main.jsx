import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import router from './routes';
import { SupabaseProvider } from './context/SupabaseContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { dark } from '@clerk/themes';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={clerkPubKey}
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: 'w-full mx-auto',
            card: 'shadow-xl rounded-xl border border-gray-200',
          },
        }}
      >
        <SupabaseProvider>
          <ToastProvider>
            <RouterProvider router={router}>
              <App />
            </RouterProvider>
          </ToastProvider>
        </SupabaseProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);

