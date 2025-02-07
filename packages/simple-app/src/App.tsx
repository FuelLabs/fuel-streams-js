'use client';

import { Header } from './components/header';
import { StreamConfiguration } from './components/stream/stream-configuration';
import { StreamView } from './components/stream/stream-view';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { StreamDataContext } from './lib/stream/use-stream-data';
import { SubscriptionsContext } from './lib/stream/use-subscriptions';

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fuel-streams-theme">
      <SubscriptionsContext.Provider>
        <StreamDataContext.Provider>
          <AppContent />
          <Toaster />
        </StreamDataContext.Provider>
      </SubscriptionsContext.Provider>
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
        <StreamConfiguration className="border-r" />
        <StreamView />
      </main>
    </div>
  );
}
