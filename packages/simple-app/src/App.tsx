'use client';

import { Header } from './components/header';
import { StreamConfiguration } from './components/stream-configuration';
import { StreamView } from './components/stream-view';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { DynamicFormContext } from './lib/form';
import { StreamDataContext } from './lib/stream/use-stream-data';

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fuel-streams-theme">
      <DynamicFormContext.Provider>
        <StreamDataContext.Provider>
          <AppContent />
          <Toaster />
        </StreamDataContext.Provider>
      </DynamicFormContext.Provider>
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
      <main className="grid grid-cols-[500px_1fr] h-[calc(100vh-56px)]">
        <StreamConfiguration className="border-r" />
        <StreamView />
      </main>
    </div>
  );
}
