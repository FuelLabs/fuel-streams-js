'use client';

import { StreamConfiguration } from './components/stream-configuration';
import { StreamView } from './components/stream-view';
import { ThemeProvider } from './components/theme-provider';
import { DynamicFormContext } from './lib/form';
import { StreamDataContext } from './lib/stream/use-stream-data';

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fuel-streams-theme">
      <DynamicFormContext.Provider>
        <StreamDataContext.Provider>
          <AppContent />
        </StreamDataContext.Provider>
      </DynamicFormContext.Provider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground grid grid-cols-[500px_1fr] h-screen">
      <StreamConfiguration />
      <StreamView />
    </div>
  );
}
