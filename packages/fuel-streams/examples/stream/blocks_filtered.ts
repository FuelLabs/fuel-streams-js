import chalk from 'chalk';
import { BlockStream, BlocksSubject, Client, ClientOpts } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Block Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);

  // Create a filtered subject
  const filteredSubject = new BlocksSubject();
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered block message: ${msg.subject}`));
    // Here you could add more processing of the filtered block message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered block'));
