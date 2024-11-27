import chalk from 'chalk';
import { Address } from 'fuels';
import { Client, ReceiptsCallSubject, ReceiptsStream } from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Receipt Streams Example');

  const client = await Client.connect({ network: 'testnet' });
  const stream = await ReceiptsStream.init(client);

  // Create a filtered subject using build
  const filteredSubject = ReceiptsCallSubject.build({
    from: Address.fromString('0x0000000000000000000000000000000000000000'),
    to: Address.fromString('0x0000000000000000000000000000000000000000'),
  });

  const subscription = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  for await (const data of subscription) {
    console.log(chalk.blue(`Received filtered receipt: ${data}`));
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered receipt'));
