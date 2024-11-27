import chalk from 'chalk';
import { Client, InputsStream, InputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Input Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await InputsStream.init(client);
  const subscription = await stream.subscribe(InputsSubject.build());

  for await (const data of subscription) {
    console.log(chalk.blue(`Received input: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('input'));
