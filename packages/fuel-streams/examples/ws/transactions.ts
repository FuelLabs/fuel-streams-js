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
  const connection = await Client.connect(FuelNetwork.Staging, 'your-api-key');

  // You can filter using subject fields before subscribing
  const subject = TransactionsSubject.build({
    kind: TransactionKind.Script,
    txStatus: TransactionStatus.Success,
  });

  // Subscribe to transactions from block 1000000
  const deliverPolicy = DeliverPolicy.fromBlock(1000000);
  const stream = await connection.subscribe(subject, deliverPolicy);
  for await (const message of stream) {
    console.log('Key:', message.key);
    console.log('Data:', message.data);
  }
}

main().catch(handleUnhandledError('transactions'));
