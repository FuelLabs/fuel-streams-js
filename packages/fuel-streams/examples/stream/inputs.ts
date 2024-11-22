import chalk from 'chalk';
import { Client, ClientOpts, InputsStream, InputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Input Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await InputsStream.init(client);
  const subscription = await stream.subscribeWithSubject(InputsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received input message: ${msg.key}`));
    // Here you could add more processing of the input message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('input'));
