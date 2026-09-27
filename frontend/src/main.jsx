import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

/* Import design system CSS in correct cascade order */
import './styles/variables.css'
import './styles/main.css'
import './styles/components.css'
import './styles/dashboard.css'
import './styles/auth.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
