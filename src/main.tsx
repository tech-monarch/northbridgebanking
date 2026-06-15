import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@/context/AuthContext';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App';
// import { AuthProvider } from '@/context/AuthContext';

// const root = document.getElementById('root');
// if (!root) throw new Error('Root element not found');

// const MAINTENANCE = import.meta.env.VITE_MAINTENANCE === 'true';

// if (MAINTENANCE) {
//   root.innerHTML = `
//     <div style="
//       height: 100vh;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       flex-direction: column;
//       font-family: Arial;
//       text-align: center;
//     ">
//       <h1>Maintenance Mode</h1>
//       <p>Try again later.</p>
//     </div>
//   `;
// } else {
//   createRoot(root).render(
//     <StrictMode>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </StrictMode>
//   );
// }