import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Auth0Provider } from '@auth0/auth0-react';

// false For Production
const DEV_MODE = false;
let clientId;
DEV_MODE ? clientId="YOUR-DEV-APP-CLIENT-ID-AUTH0" : clientId="YOUR-PROD-APP-CLIENT-ID-AUTH0";

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <Auth0Provider
    domain="YOUR-AUTH0-DOMAIN"
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App DEV_MODE = {DEV_MODE} />
  </Auth0Provider>
  </React.StrictMode>,
)
