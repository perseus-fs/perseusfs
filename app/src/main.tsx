import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/app';
import { DialogProvider } from './components/dialogs';
import { ThemeProvider } from './components/theme-provider';
import { SidebarProvider } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import './index.css';
import { queryClient } from './query-client';
import { store } from './store';

const isProduction = import.meta.env.MODE === 'production';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter basename={isProduction ? '/_' : undefined}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <DialogProvider />
            <SidebarProvider defaultOpen>
              <App />
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
