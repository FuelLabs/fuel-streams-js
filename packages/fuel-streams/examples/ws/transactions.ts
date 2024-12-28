import { handleUnhandledError } from 'examples/helpers';
import {
  Client,
  DeliverPolicy,
  FuelNetwork,
  TransactionKind,
  TransactionStatus,
  TransactionsSubject,
} from '../../src';

async function main() {
  const client = await Client.new(FuelNetwork.Staging);
  const connection = await client.connect();

  // You can filter using subject fields before subscribing
  const subject = TransactionsSubject.build({
    kind: TransactionKind.Script,
    status: TransactionStatus.Success,
  });

  const stream = await connection.subscribe(subject, DeliverPolicy.New);
  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
  }
}

main().catch(handleUnhandledError('transactions'));
