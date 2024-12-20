import fetch from 'cross-fetch';
import { FuelStreamsClient } from 'src/index';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock `fetch` globally
global.fetch = fetch;

vi.mock('cross-fetch');

const MOCK_NETWORK_URL = 'https://fuel-streams.com'; // Network URL
const MOCK_WS_URL = 'wss://fuel-streams.com/api/v1/ws'; // WebSocket URL
const MOCK_USERNAME = 'testUser';
const MOCK_PASSWORD = 'testPass';
const MOCK_JWT = 'mock-jwt-token';

describe('FuelStreamsClient', () => {
  let client: FuelStreamsClient;

  beforeEach(() => {
    // Mock JWT fetch
    vi.resetAllMocks();
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (url === `${MOCK_NETWORK_URL}/api/v1/jwt`) {
        return {
          ok: true,
          json: async () => ({ jwt_token: MOCK_JWT }),
        } as Response;
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    // Initialize FuelStreamsClient and inject mock WebSocket
    client = new FuelStreamsClient(
      MOCK_NETWORK_URL,
      MOCK_USERNAME,
      MOCK_PASSWORD,
    );
    client.setWebsocketModule(MockWebSocket); // Inject mock WebSocket
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch JWT via refreshJwt', async () => {
    await client.refreshJwt();
    expect(fetch).toHaveBeenCalledWith(`${MOCK_NETWORK_URL}/api/v1/jwt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: MOCK_USERNAME,
        password: MOCK_PASSWORD,
      }),
    });
  });

  test('should connect to WebSocket server', async () => {
    await client.connect();

    expect(client.ws).toBeInstanceOf(MockWebSocket);
    expect(client.ws?.url).toBe(MOCK_WS_URL);
  });

  test('should send subscription message to WebSocket server', async () => {
    await client.connect();
    const ws = client.ws as MockWebSocket;

    const messageSpy = vi.fn();
    ws.onmessage = messageSpy;

    client.subscribe('example.topic', { type: 'All' });

    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: JSON.stringify({
          type: 'Subscribe',
          payload: {
            wildcard: 'example.topic',
            deliverPolicy: { type: 'All' },
          },
        }),
      }),
    );
  });

  test('should send unsubscription message to WebSocket server', async () => {
    await client.connect();
    const ws = client.ws as MockWebSocket;

    const messageSpy = vi.fn();
    ws.onmessage = messageSpy;

    client.unsubscribe('example.topic'); // No deliverPolicy specified, defaults to { type: 'All' }

    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: JSON.stringify({
          type: 'Unsubscribe',
          payload: {
            wildcard: 'example.topic',
            deliverPolicy: { type: 'All' },
          },
        }),
      }),
    );
  });

  test('should handle incoming messages from WebSocket server', async () => {
    const mockMessage = { type: 'TestMessage', data: { foo: 'bar' } };

    await client.connect();
    const ws = client.ws as MockWebSocket;

    const onMessage = vi.fn();
    client.listen(onMessage);

    ws.triggerMessage(JSON.stringify(mockMessage)); // Trigger incoming message

    expect(onMessage).toHaveBeenCalledWith(mockMessage);
  });

  test('should disconnect from WebSocket server', async () => {
    await client.connect();
    const ws = client.ws as MockWebSocket;

    ws.close = vi.fn();
    client.disconnect();

    expect(ws.close).toHaveBeenCalled();
    expect(client.ws).toBeNull();
  });
});

// Define the mock WebSocket class
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.CLOSED;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;

  constructor(
    public url: string,
    public protocols?: string[],
  ) {
    // Automatically trigger `onopen` after construction to simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }

  triggerMessage(data: string) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}
