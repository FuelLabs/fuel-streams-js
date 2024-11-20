import chalk from 'chalk';
import { Client, ClientOpts, ReceiptStream, ReceiptsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Receipt Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await ReceiptStream.init(client);
  const subscription = await stream.subscribeWithSubject(ReceiptsSubject.all());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received receipt message: ${msg.key}`));
    // Here you could add more processing of the receipt message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('receipt'));
