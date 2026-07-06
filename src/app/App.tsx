import { BrowserRouter } from 'react-router-dom';
import { AuthGate } from '@/components/auth/AuthGate';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppRoutes />
      </AuthGate>
    </BrowserRouter>
  );
}
