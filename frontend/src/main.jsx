// Starts React: loads the design system once, then renders <App /> into #root.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { PlaylistsProvider } from './context/PlaylistsContext.jsx'
import { AuthModalProvider } from './context/AuthModalContext.jsx'
import './styles/style.css'

// Wrappers, outside in: StrictMode (extra dev checks), router (URLs),
// UserProvider (logged-in user), PlaylistsProvider (that user's playlists;
// inside UserProvider because it needs to know who is logged in),
// AuthModalProvider (the sign-in modal; its form logs in through UserProvider).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <PlaylistsProvider>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </PlaylistsProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
