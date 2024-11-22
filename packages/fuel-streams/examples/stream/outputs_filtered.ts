import chalk from 'chalk';
import { Address } from 'fuels';
import {
  Client,
  ClientOpts,
  OutputsCoinSubject,
  OutputsStream,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Output Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await OutputsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = OutputsCoinSubject.build({
    to: Address.fromString('0x0000000000000000000000000000000000000000'),
  });

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered output message: ${msg.subject}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered output'));
