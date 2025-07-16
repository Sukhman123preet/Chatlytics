import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
 <Auth0Provider
    domain="dev-nzo8dam8t66m000i.us.auth0.com"
    clientId="iLekHUUAgpZoi6Twfdmc4sCRsbhqbeHk"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
)
