import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
 <Auth0Provider
    domain="sukhmanpreet.us.auth0.com"
    clientId="mx2MeTBCweIRdxkQ2YveGsJmFh5AAPnL"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
)
