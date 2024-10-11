export interface IStreamData<_T> {
  timestamp: string;
  payload: Uint8Array;
}

export class StreamData<T> implements IStreamData<T> {
  public readonly timestamp: string;

  constructor(public readonly payload: Uint8Array) {
    const now = new Date();
    this.timestamp = now.toISOString();
  }

  public tsAsMillis() {
    const parsedDate = Date.parse(this.timestamp);
    return Number.isNaN(parsedDate) ? Date.now() : parsedDate;
  }

  public decode(): T {
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(this.payload);
    const data = JSON.parse(jsonString);
    return data as T;
  }
}
