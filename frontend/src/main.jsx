import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './styles/variables.css'
import './styles/base.css'
import './styles/componentes.css'

createRoot(document.getElementById('root')).render(
    <App />
)
