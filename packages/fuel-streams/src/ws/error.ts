export class ClientError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ClientError';
  }

  static JsonParseError(cause: Error): ClientError {
    return new ClientError(
      'Failed to parse server response. Please try again or contact support if the issue persists.',
      cause,
    );
  }

  static UrlParseError(cause: Error): ClientError {
    return new ClientError(
      'Invalid server URL configuration. Please check your network settings.',
      cause,
    );
  }

  static ApiError(cause: Error): ClientError {
    return new ClientError(
      'Server request failed. Please check your connection and try again.',
      cause,
    );
  }

  static WebSocketError(cause: Error): ClientError {
    return new ClientError(
      'Connection to server failed. Please check your internet connection and API key, then try again.',
      cause,
    );
  }

  static MissingApiKey(): ClientError {
    return new ClientError(
      'API key is required. Please provide a valid API key to connect.',
    );
  }

  static InvalidApiKey(): ClientError {
    return new ClientError(
      'Invalid API key. Please check your API key and try again.',
    );
  }

  static ConnectionTimeout(): ClientError {
    return new ClientError(
      'Connection timed out. Please check your internet connection and try again.',
    );
  }

  static SubscriptionError(subject: string): ClientError {
    return new ClientError(
      `Failed to subscribe to ${subject}. Please try again.`,
    );
  }

  static NetworkError(network: string): ClientError {
    return new ClientError(
      `Failed to connect to ${network} network. Please check your network settings and try again.`,
    );
  }

  static UnauthorizedError(): ClientError {
    return new ClientError(
      'Unauthorized access. Please check your API key and permissions.',
    );
  }

  getUserMessage(): string {
    return this.cause
      ? `${this.message} (${this.cause.message})`
      : this.message;
  }
}
