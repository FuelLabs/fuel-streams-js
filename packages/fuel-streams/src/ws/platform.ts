// Platform-specific implementations
export interface WebSocketImpl {
  new (url: string, protocols?: string | string[]): WebSocket;
}

export interface WebSocketOptions {
  headers?: Record<string, string>;
}

let wsImpl: WebSocketImpl;

// Initialize WebSocket implementation
if (typeof window !== 'undefined') {
  // Browser environment
  wsImpl = window.WebSocket;
} else {
  // Node.js environment
  try {
    // Using dynamic import for ESM compatibility
    const ws = require('ws');
    wsImpl = ws as unknown as WebSocketImpl;
  } catch (error) {
    console.error('WebSocket import error:', error);
    throw new Error('Please install ws package for Node.js environment');
  }
}

if (!wsImpl) {
  throw new Error('No WebSocket implementation found');
}

export { wsImpl as WebSocket };
