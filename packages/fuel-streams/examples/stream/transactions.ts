import chalk from 'chalk';
import { Client, TransactionsStream, TransactionsSubject } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Transaction Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await TransactionsStream.init(client);
  const subscription = await stream.subscribe(TransactionsSubject.build());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received transaction message: ${msg.key}`));
    // Here you could add more processing of the transaction message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('transaction'));
