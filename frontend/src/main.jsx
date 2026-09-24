// Starts React: loads the design system once, then renders <App /> into #root.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import './styles/style.css'

// Wrappers, outside in: StrictMode (extra dev checks), router (URLs),
// UserProvider (logged-in user available to every block).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
