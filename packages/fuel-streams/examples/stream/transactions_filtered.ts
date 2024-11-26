import { Client, TransactionsByIdSubject, TransactionsStream } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Transaction Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await TransactionsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = TransactionsByIdSubject.build();
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume();
  for await (const msg of iter) {
    console.log(msg.data);
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered transaction'));
