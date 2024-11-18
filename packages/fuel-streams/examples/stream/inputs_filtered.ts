import chalk from 'chalk';
import { Client, ClientOpts, InputStream, InputsCoinSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Input Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await InputStream.init(client);

  // Create a filtered subject
  const filteredSubject = new InputsCoinSubject().withOwner(
    '0x0000000000000000000000000000000000000000', // Replace with an actual owner address if known
  );

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered input message: ${msg.subject}`));
    // Here you could add more processing of the filtered input message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered input'));
