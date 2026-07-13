import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Toaster } from 'react-hot-toast'; // Importe aqui
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} /> {/* Fixo aqui */}
    <App />
  </StrictMode>,
  </BrowserRouter>
)
