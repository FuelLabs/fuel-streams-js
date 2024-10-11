import chalk from 'chalk';
import { BlockStream, BlocksSubject, Client, ClientOpts } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Block Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);
  const subscription = await stream.subscribe(BlocksSubject.all());

  for await (const msg of subscription) {
    console.log(chalk.blue(`Received block message: ${msg.key}`));
    // Here you could add more processing of the block message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('block'));
