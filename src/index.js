import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'cloud1-5g8unv4l1a3f77a1'   // 替换成你的云环境ID，例如 jiajiachu-prod-123abc
});

export const db = app.database();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
