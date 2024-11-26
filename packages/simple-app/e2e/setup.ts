import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';
import { afterAll, beforeAll } from 'vitest';

let server: ViteDevServer;

beforeAll(async () => {
  // Start the Vite dev server
  server = await createServer({
    configFile: './vite.config.ts',
    server: {
      port: 5173,
    },
  });

  await server.listen();

  // Wait a bit to ensure server is ready
  await new Promise((resolve) => setTimeout(resolve, 1000));
}, 30000);

afterAll(async () => {
  // Close the server after all tests are done
  await server?.close();
});
