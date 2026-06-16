import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@/context/AuthContext';

function Root() {
  useEffect(() => {
    const existing = document.getElementById("jivo-script");

    if (existing) return;

    const script = document.createElement("script");
    script.id = "jivo-script";
    script.src = "https://code.jivosite.com/widget/qjVCSE8PoK";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <App />;
}

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);