'use client';

import { Header } from './components/header';
import { StreamConfiguration } from './components/stream/stream-configuration';
import { StreamView } from './components/stream/stream-view';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { StreamDataContext } from './lib/stream/use-stream-data';

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      role="application"
      aria-label="Fuel Streams Application"
    >
      <Header />
      <main className="grid grid-cols-[500px_1fr] h-[calc(100vh-56px)] max-w-screen w-screen">
        <StreamDataContext.Provider>
          <StreamConfiguration className="border-r" />
          <StreamView />
        </StreamDataContext.Provider>
      </main>
    </div>
  );
}
