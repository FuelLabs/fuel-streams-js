import chalk from 'chalk';
import { Client, ClientOpts, OutputsStream, OutputsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Output Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await OutputsStream.init(client);
  const subscription = await stream.subscribeWithSubject(
    OutputsSubject.build(),
  );

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received output message: ${msg.key}`));
    // Here you could add more processing of the output message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('output'));
