// Platform-specific implementations
export interface WebSocketImpl {
  new (url: string, protocols?: string | string[]): WebSocket;
}

export interface WebSocketOptions {
  headers?: Record<string, string>;
}

let wsImpl: WebSocketImpl;
let fetchImpl: typeof fetch;

// Platform detection and initialization
if (typeof window !== 'undefined') {
  // Browser environment
  wsImpl = window.WebSocket;
  fetchImpl = window.fetch.bind(window);
} else {
  // Node.js environment
  try {
    // Use dynamic import instead of require
    import('ws')
      .then((WebSocket) => {
        // @ts-ignore
        wsImpl = WebSocket.default;
      })
      .catch(() => {
        throw new Error('Please install ws package for Node.js environment');
      });
    fetchImpl = fetch; // Use global fetch in Node.js environments
  } catch (_e) {
    throw new Error('Please install ws package for Node.js environment');
  }
}

export { wsImpl as WebSocket, fetchImpl as fetch };
