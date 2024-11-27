import chalk from 'chalk';
import { Client, TransactionsByIdSubject, TransactionsStream } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Transaction Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await TransactionsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = TransactionsByIdSubject.build();
  const subscription = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  for await (const data of subscription) {
    console.log(chalk.blue(`Received filtered transaction: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered transaction'));
