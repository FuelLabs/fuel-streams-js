import chalk from 'chalk';
import { Address } from 'fuels';
import { Client, InputsCoinSubject, InputsStream } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Input Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await InputsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = InputsCoinSubject.build({
    owner: Address.fromString('0x0000000000000000000000000000000000000000'),
  });

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume();
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered input message: ${msg.subject}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered input'));
