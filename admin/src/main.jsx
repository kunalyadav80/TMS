import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Auth0Provider } from '@auth0/auth0-react';

// false For Production
const DEV_MODE = false;
let clientId;
DEV_MODE ? clientId="PROD_CLIENT_ID_AUTH0_APP" : clientId="DEV_CLIENT_ID_AUTH0_APP";

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
