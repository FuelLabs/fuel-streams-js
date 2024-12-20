import fetch from 'cross-fetch';
import WebSocket from 'isomorphic-ws';

interface LoginResponse {
  jwt_token: string;
}

// Define DeliverPolicy as per the Rust model
type DeliverPolicy =
  | { type: 'All' }
  | { type: 'Last' }
  | { type: 'New' }
  | { type: 'ByStartSequence'; startSequence: number }
  | { type: 'ByStartTime'; startTime: string }
  | { type: 'LastPerSubject' };

// SubscriptionPayload matches the Rust structure
interface SubscriptionPayload {
  wildcard: string;
  deliverPolicy: DeliverPolicy;
}

// ClientMessage matches the Rust model
type ClientMessage =
  | { type: 'Subscribe'; payload: SubscriptionPayload }
  | { type: 'Unsubscribe'; payload: SubscriptionPayload };

// ServerMessage matches the Rust model
type ServerMessage =
  | { type: 'Subscribed'; payload: SubscriptionPayload }
  | { type: 'Unsubscribed'; payload: SubscriptionPayload }
  | { type: 'Update'; payload: Uint8Array }
  | { type: 'Error'; payload: string };

export class FuelStreamsClient {
  private wsUrl: string;
  private jwtToken: string | null = null;

  private websocketModule = WebSocket;
  public ws: WebSocket | null = null;

  constructor(
    private networkUrl: string,
    private username: string,
    private password: string,
  ) {
    this.wsUrl = `${networkUrl.replace('http', 'ws')}/api/v1/ws`;
    console.log('WebSocket URL:', this.wsUrl);
  }

  /** @internal */
  public setWebsocketModule(module: WebSocket): void {
    this.websocketModule = module;
  }

  public async refreshJwt(): Promise<void> {
    this.jwtToken = await this.fetchJWT();
  }

  // Connect to WebSocket
  public async connect(): Promise<void> {
    if (!this.jwtToken) {
      this.jwtToken = await this.fetchJWT();
    }

    return new Promise((resolve, reject) => {
      this.ws = new this.websocketModule(this.wsUrl, {
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
        },
      });

      this.ws.onopen = () => {
        console.log('Connected to WebSocket');
        resolve();
      };

      this.ws.onerror = (error: Error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = ({
        code,
        reason,
      }: { code: string; reason: string }) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
      };
    });
  }

  // Fetch JWT (works in both environments with cross-fetch)
  private async fetchJWT(): Promise<string> {
    const response = await fetch(`${this.networkUrl}/api/v1/jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JWT: ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();
    return data.jwt_token;
  }

  // Send a message to WebSocket
  private sendMessage(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const serializedMessage = JSON.stringify(message);
    this.ws.send(serializedMessage);
  }

  // Subscribe to a topic
  public subscribe(wildcard: string, deliverPolicy: DeliverPolicy): void {
    const payload: SubscriptionPayload = { wildcard, deliverPolicy };
    const message: ClientMessage = { type: 'Subscribe', payload };
    this.sendMessage(message);
  }

  // Unsubscribe from a topic
  public unsubscribe(
    wildcard: string,
    deliverPolicy: DeliverPolicy = { type: 'All' },
  ): void {
    const payload: SubscriptionPayload = { wildcard, deliverPolicy };
    const message: ClientMessage = { type: 'Unsubscribe', payload };
    this.sendMessage(message);
  }

  // Listen for server messages
  public listen(callback: (message: ServerMessage) => void): void {
    if (!this.ws) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.onmessage = ({ data }: { data: string }) => {
      const message: ServerMessage = JSON.parse(data);
      callback(message);
    };
  }

  // Disconnect from WebSocket
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
