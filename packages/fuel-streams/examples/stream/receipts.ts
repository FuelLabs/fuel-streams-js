import chalk from 'chalk';
import { Client, ReceiptsStream, ReceiptsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Receipt Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await ReceiptsStream.init(client);
  const subscription = await stream.subscribe(ReceiptsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received receipt message: ${msg.key}`));
    // Here you could add more processing of the receipt message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('receipt'));
