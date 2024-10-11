import chalk from 'chalk';
import {
  BlockStream,
  BlocksSubject,
  Client,
  ClientOpts,
  DeliverPolicy,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Block Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);

  // Create a filtered subject
  const filteredSubject = new BlocksSubject()
    .withProducer('0x000') // Replace with an actual producer ID if known
    .withHeight(1000); // Filter for blocks at height 1000 and above

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
    deliverPolicy: DeliverPolicy.New,
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered block message: ${msg.subject}`));
    // Here you could add more processing of the filtered block message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered block'));
