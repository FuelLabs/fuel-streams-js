export class ClientError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ClientError';
  }

  static JsonParseError(cause: Error): ClientError {
    return new ClientError('Failed to parse JSON', cause);
  }

  static UrlParseError(cause: Error): ClientError {
    return new ClientError('Failed to parse URL', cause);
  }

  static ApiError(cause: Error): ClientError {
    return new ClientError('API request failed', cause);
  }

  static WebSocketError(cause: Error): ClientError {
    return new ClientError('WebSocket error', cause);
  }

  static MissingJwtToken(): ClientError {
    return new ClientError('Missing JWT token');
  }
}
