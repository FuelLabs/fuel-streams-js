import type { Client } from '../client/natsClient';
import { StreamNames } from '../constants';
import type {
  StreamedBlock,
  StreamedInput,
  StreamedLog,
  StreamedOutput,
  StreamedReceipt,
  StreamedTransaction,
} from '../data';
import { FuelStream } from './fuelStream';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlockStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedBlock>(StreamNames.Blocks);
    return stream.init(client);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TransactionStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedTransaction>(
      StreamNames.Transactions,
    );
    return stream.init(client);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InputStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedInput>(StreamNames.Inputs);
    return stream.init(client);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OutputStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedOutput>(StreamNames.Outputs);
    return stream.init(client);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ReceiptStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedReceipt>(StreamNames.Receipts);
    return stream.init(client);
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogStream {
  static async init(client: Client) {
    const stream = FuelStream.get<StreamedLog>(StreamNames.Logs);
    return stream.init(client);
  }
}
