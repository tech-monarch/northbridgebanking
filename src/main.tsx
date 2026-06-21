// import { StrictMode, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App';
// import { AuthProvider } from '@/context/AuthContext';

// function Root() {
//   useEffect(() => {
//     const existing = document.getElementById('tawk-script');

//     if (existing) return;

//     const script = document.createElement('script');
//     script.id = 'tawk-script';
//     script.async = true;
//     script.src =
//       'https://embed.tawk.to/6a32c53466a0b51d461c6706/1jrb54md2';
//     script.charset = 'UTF-8';
//     script.setAttribute('crossorigin', '*');

//     const firstScript = document.getElementsByTagName('script')[0];

//     if (firstScript?.parentNode) {
//       firstScript.parentNode.insertBefore(script, firstScript);
//     } else {
//       document.body.appendChild(script);
//     }

//     return () => {
//       script.remove();
//     };
//   }, []);

//   return <App />;
// }

// const root = document.getElementById('root');

// if (!root) throw new Error('Root element not found');

// createRoot(root).render(
//   <StrictMode>
//     <AuthProvider>
//       <Root />
//     </AuthProvider>
//   </StrictMode>
// );



import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@/context/AuthContext';

function Root() {
  useEffect(() => {
    const existing = document.getElementById('jivo-script');

    if (existing) return;

    const script = document.createElement('script');
    script.id = 'jivo-script';
    script.async = true;
    script.src = '//code.jivosite.com/widget/qjVCSE8PoK';

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