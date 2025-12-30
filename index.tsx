
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service Worker Kaydı (Geliştirilmiş versiyon)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Path belirtirken ./ yerine direkt isim kullanmak bazen daha stabildir
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Sistem Hazır (SW Active)');
      })
      .catch(error => {
        console.error('Sistem Yükleme Hatası:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
