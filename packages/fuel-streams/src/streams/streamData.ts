export interface IStreamData<T> {
  subject: string;
  timestamp: string;
  payload: T;
}

export class StreamData<T> {
  private timestamp: string;
  constructor(
    public subject: string,
    public payload: T,
  ) {
    const now = new Date();
    // ISO 8601 timestamp in JavaScript
    this.timestamp = now.toISOString();
  }

  // Optional helper function to get timestamp in milliseconds
  public tsAsMillis(): number {
    const parsedDate = Date.parse(this.timestamp);
    return Number.isNaN(parsedDate) ? Date.now() : parsedDate;
  }
}
