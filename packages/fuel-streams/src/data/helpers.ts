import { Address } from 'fuels';

export function toB256(value: string): string {
  return Address.fromString(value).toB256();
}
