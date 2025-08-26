import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.jsx'

console.log("Auth0 Domain:", import.meta.env.VITE_APP_AUTH0_DOMAIN);
console.log("Auth0 Client ID:", import.meta.env.VITE_APP_AUTH0_CLIENT_ID);


createRoot(document.getElementById('root')).render(
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri:  window.location.origin
  }}
>
  <App />
</Auth0Provider>
,
)
