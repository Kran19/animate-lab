import React from 'react';
import { AppProvider } from './store/appStore';
import { AppShell } from './components/layout/AppShell';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default App;
