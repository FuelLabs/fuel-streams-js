export class LocalStorage {
  constructor(readonly key: string) {}

  get<T>(): T | null {
    const value = localStorage.getItem(this.key);
    return value ? JSON.parse(value) : null;
  }

  set<T>(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  remove(): void {
    localStorage.removeItem(this.key);
  }
}
