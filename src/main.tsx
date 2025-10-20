import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { SidebarProvider } from '@/components/ui/sidebar.tsx';
import { ChatProvider } from '@/components/chat-provider.tsx';

import { App } from './App.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='theme'>
      <SidebarProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </SidebarProvider>

      <Toaster />
    </ThemeProvider>
  </StrictMode>
);

