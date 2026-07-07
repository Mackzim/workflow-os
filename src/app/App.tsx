import { BrowserRouter } from 'react-router-dom';
import { AuthGate } from '@/components/auth/AuthGate';
import { BootSequence } from '@/components/layout/BootSequence';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <BootSequence />
      <AuthGate>
        <AppRoutes />
      </AuthGate>
    </BrowserRouter>
  );
}
