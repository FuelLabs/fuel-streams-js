import chalk from 'chalk';
import { Client, InputsStream, InputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Input Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await InputsStream.init(client);
  const subscription = await stream.subscribe(InputsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received input message: ${msg.key}`));
    // Here you could add more processing of the input message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('input'));
