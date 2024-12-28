/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 */

import v from 'voca';

export type GenericRecord = Record<string, any>;

export interface EntityParser<
  T extends GenericRecord,
  R extends GenericRecord,
> {
  parse(data: R): T;
}

export abstract class SubjectBase<
  TFields extends GenericRecord,
  T extends GenericRecord,
  R extends GenericRecord,
> {
  constructor(protected fields: Partial<TFields> = {}) {}
  protected abstract format: string;

  abstract entityParser(): EntityParser<T, R>;

  // This is a hack to make the compiler happy
  _entity(): T {
    return {} as T;
  }
  _rawEntity(): R {
    return {} as R;
  }

  parse(): string {
    const fields = Object.entries(this.fields).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = value?.toString() ?? '*';
        return acc;
      },
      {},
    );

    return this.format.replace(
      /\{([^}]+)\}/g,
      (_, key: string) => fields[v.camelCase(key)] ?? '*',
    );
  }

  build(fields: Partial<TFields>): this {
    this.fields = { ...this.fields, ...fields };
    return this;
  }

  static build<
    T extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
  >(this: new () => T, fields: Partial<Parameters<T['build']>[0]> = {}): T {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().build(fields);
  }

  static wildcard<
    T extends SubjectBase<GenericRecord, GenericRecord, GenericRecord>,
  >(this: new () => T): string {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().parse();
  }
}
