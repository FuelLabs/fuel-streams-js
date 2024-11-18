import {
  Client,
  ClientOpts,
  TransactionStream,
  TransactionsByIdSubject,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Transaction Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await TransactionStream.init(client);

  // Create a filtered subject
  const filteredSubject = new TransactionsByIdSubject();
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(msg.data);
    // Here you could add more processing of the filtered transaction message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered transaction'));
