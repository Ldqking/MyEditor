import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

import('./App')
  .then(({ App }) => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error(error);
    root.render(
      <div style={{ padding: 24, color: '#ff8e95', background: '#111316', minHeight: '100vh' }}>
        <h1>编辑器加载失败</h1>
        <pre>{error instanceof Error ? error.stack : String(error)}</pre>
      </div>,
    );
  });
