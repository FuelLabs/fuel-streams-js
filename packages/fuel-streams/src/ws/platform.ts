// Platform-specific implementations
export interface WebSocketImpl {
  new (url: string, protocols?: string | string[]): WebSocket;
}

export interface WebSocketOptions {
  headers?: Record<string, string>;
}

let wsImpl: WebSocketImpl;

// Platform detection and initialization
if (typeof window !== 'undefined') {
  // Browser environment
  wsImpl = window.WebSocket;
} else {
  // Node.js environment
  // Using require instead of import for synchronous loading
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const WebSocket = require('ws');
    wsImpl = WebSocket;
  } catch (_error: any) {
    throw new Error('Please install ws package for Node.js environment');
  }
}

if (!wsImpl) {
  throw new Error('No WebSocket implementation found');
}

export { wsImpl as WebSocket };
