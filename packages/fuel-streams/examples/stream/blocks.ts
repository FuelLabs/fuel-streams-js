import chalk from 'chalk';
import { BlocksStream, BlocksSubject, Client } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Block Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await BlocksStream.init(client);
  const subscription = await stream.subscribe(BlocksSubject.build());

  for await (const data of subscription) {
    console.log(chalk.blue(`Received block: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('block'));
