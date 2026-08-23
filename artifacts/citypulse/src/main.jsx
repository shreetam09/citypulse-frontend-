import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

// In production, point API calls to the live backend on Render.
// In dev mode, Vite's proxy handles /api → localhost:5050.
if (import.meta.env.PROD) {
  setBaseUrl('https://citypulse-backend-jy2v.onrender.com');
}
createRoot(document.getElementById('root'), {
    // Keeps caught errors off reportError(), which would raise the dev overlay.
    onCaughtError: (error, errorInfo) => {
        console.error(error, errorInfo.componentStack);
    },
}).render(<ErrorBoundary>
    <App />
  </ErrorBoundary>);
