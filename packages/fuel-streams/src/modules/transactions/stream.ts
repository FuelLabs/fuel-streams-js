import type { Client } from '../../nats-client';
import { TransactionParser } from '../../parsers';
import { Stream } from '../../stream';
import { StreamNames, type Transaction } from '../../types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TransactionsStream {
  static async init(client: Client) {
    const parser = new TransactionParser();
    return Stream.get<Transaction>(client, StreamNames.Transactions, parser);
  }
}
