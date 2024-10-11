import type { Subject } from '../data/types';

/**
 * Abstract base class for subject implementations.
 * @template T - Type extending Record<string, any>
 * @implements {Subject}
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export abstract class SubjectBase<T extends Record<string, any>>
  implements Subject
{
  /**
   * Creates an instance of SubjectBase.
   * @param {Partial<T>} fields - Partial fields of type T
   */
  constructor(protected fields: Partial<T> = {}) {}

  /**
   * Parses the subject into a string representation.
   * @abstract
   * @returns The parsed subject string
   */
  abstract parse(): string;

  /**
   * Updates a field in the subject.
   * @template K - Key of T
   * @param {K} key - The key to update
   * @param {T[K] | null} value - The value to set
   * @returns The updated subject instance
   */
  with<K extends keyof T>(key: K, value: T[K] | null): this {
    (this.fields as Record<K, T[K] | null>)[key] = value;
    return this;
  }

  /**
   * Creates a wildcard representation of the subject.
   * @template U - Type extending SubjectBase<Record<string, unknown>>
   * @returns The wildcard string representation
   */
  static wildcard<U extends SubjectBase<Record<string, unknown>>>(
    this: new () => U,
  ): string {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().parse();
  }

  /**
   * Creates an instance of the subject with all fields unset.
   * @template U - Type extending SubjectBase<Record<string, unknown>>
   * @returns A new instance of the subject
   */
  static all<U extends SubjectBase<Record<string, unknown>>>(
    this: new () => U,
  ): U {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this();
  }
}
