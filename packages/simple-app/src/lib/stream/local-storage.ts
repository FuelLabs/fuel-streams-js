export class LocalStorage {
  constructor(readonly key: string) {}

  getApiKey(): string | null {
    return localStorage.getItem(this.key);
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem(this.key, apiKey);
  }

  removeApiKey(): void {
    localStorage.removeItem(this.key);
  }
}
