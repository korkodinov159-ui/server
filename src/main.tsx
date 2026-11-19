import React from 'react';
import ReactDOM from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { App } from './App';
import './styles.css';

async function bootstrap() {
  try {
    await vkBridge.send('VKWebAppInit');
  } catch (error) {
    console.warn('VK Bridge initialization failed:', error);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrap();