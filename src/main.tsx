import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css'; // <-- ДОБАВИТЬ ЭТУ СТРОКУ

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);