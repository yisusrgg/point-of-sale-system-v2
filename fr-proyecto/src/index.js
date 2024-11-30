import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import {DatosGlobalesProvider} from './Components/ContextoDatosGlobales';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DatosGlobalesProvider>
      <App />
    </DatosGlobalesProvider>
  </React.StrictMode>
);
