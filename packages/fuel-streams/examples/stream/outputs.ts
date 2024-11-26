import chalk from 'chalk';
import { Client, OutputsStream, OutputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Output Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await OutputsStream.init(client);
  const subscription = await stream.subscribe(OutputsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received output message: ${msg.subject}`));
    // Here you could add more processing of the output message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('output'));
