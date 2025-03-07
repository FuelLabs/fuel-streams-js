import { handleUnhandledError } from 'examples/helpers';
import {
  Client,
  DeliverPolicy,
  FuelNetwork,
  TransactionStatus,
  TransactionType,
  TransactionsSubject,
} from '../../src';

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, 'your-api-key');

  // You can filter using subject fields before subscribing
  const subjects = [
    TransactionsSubject.build({
      txType: TransactionType.Script,
      txStatus: TransactionStatus.Success,
    }),
  ];

  // Subscribe to transactions from block 1000000
  const deliverPolicy = DeliverPolicy.fromBlock(1000000);
  const stream = await connection.subscribe(subjects, deliverPolicy);
  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
  }
}

main().catch(handleUnhandledError('transactions'));
