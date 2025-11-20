import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './components/common/ToastProvider.jsx';
import './utils/installFetchCache.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
                  <ToastProvider position="top-right" offsetTop="calc(var(--header-h, 72px) + 12px)">
      <CartProvider>
        <App />
      </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
