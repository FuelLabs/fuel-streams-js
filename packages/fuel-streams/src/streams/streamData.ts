/**
 * Interface representing stream data.
 * @template T - The type of the decoded payload.
 */
export interface IStreamData<_T> {
  /** ISO 8601 timestamp string */
  timestamp: string;
  /** Raw payload data */
  payload: Uint8Array;
}

/**
 * Class representing stream data with decoding capabilities.
 * @template T - The type of the decoded payload.
 * @implements {IStreamData<T>}
 */
export class StreamData<T> implements IStreamData<T> {
  /** @inheritdoc */
  public readonly timestamp: string;

  /**
   * Creates an instance of StreamData.
   * @param {Uint8Array} payload - The raw payload data.
   */
  constructor(public readonly payload: Uint8Array) {
    const now = new Date();
    this.timestamp = now.toISOString();
  }

  /**
   * Converts the timestamp to milliseconds.
   * @returns The timestamp in milliseconds.
   */
  public tsAsMillis(): number {
    const parsedDate = Date.parse(this.timestamp);
    return Number.isNaN(parsedDate) ? Date.now() : parsedDate;
  }

  /**
   * Decodes the payload into the specified type.
   * @returns The decoded payload.
   * @throws {SyntaxError} If the JSON parsing fails.
   */
  // TODO: finish this when have postcard decoding
  public decode(): T {
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(this.payload);
    const data = JSON.parse(jsonString);
    return data as T;
  }
}
