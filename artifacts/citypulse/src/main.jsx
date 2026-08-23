import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

// Ensure every API call automatically attaches the JWT token from localStorage
setAuthTokenGetter(() => localStorage.getItem('cp_access_token'));
createRoot(document.getElementById('root'), {
    // Keeps caught errors off reportError(), which would raise the dev overlay.
    onCaughtError: (error, errorInfo) => {
        console.error(error, errorInfo.componentStack);
    },
}).render(<ErrorBoundary>
    <App />
  </ErrorBoundary>);
