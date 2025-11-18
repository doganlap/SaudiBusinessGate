import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme-variables.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdvancedThemeProvider } from './contexts/AdvancedThemeContext';
import { NotificationsProvider } from './ui/Notifications';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdvancedThemeProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </ThemeProvider>
    </AdvancedThemeProvider>
  </React.StrictMode>
);

