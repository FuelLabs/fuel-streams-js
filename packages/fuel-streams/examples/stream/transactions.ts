import chalk from 'chalk';
import {
  Client,
  ClientOpts,
  TransactionsStream,
  TransactionsSubject,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Transaction Streams Example');

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await TransactionsStream.init(client);
  const subscription = await stream.subscribeWithSubject(
    TransactionsSubject.build(),
  );

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received transaction message: ${msg.key}`));
    // Here you could add more processing of the transaction message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('transaction'));
