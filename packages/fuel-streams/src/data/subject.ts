import type { Subject } from './types';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export abstract class SubjectBase<T extends Record<string, any>>
  implements Subject
{
  constructor(protected fields: Partial<T> = {}) {}
  abstract parse(): string;

  with<K extends keyof T>(key: K, value: T[K] | null): this {
    (this.fields as Record<K, T[K] | null>)[key] = value;
    return this;
  }

  static wildcard<U extends SubjectBase<Record<string, unknown>>>(
    this: new () => U,
  ): string {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().parse();
  }

  static all<U extends SubjectBase<Record<string, unknown>>>(
    this: new () => U,
  ): U {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this();
  }
}
