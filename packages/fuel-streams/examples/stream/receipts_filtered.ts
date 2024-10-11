import chalk from 'chalk';
import { Address } from 'fuels';
import {
  Client,
  ClientOpts,
  DeliverPolicy,
  ReceiptStream,
  ReceiptsCallSubject,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Receipt Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await ReceiptStream.init(client);

  // Create a filtered subject
  const filteredSubject = new ReceiptsCallSubject()
    .withFrom(Address.fromString('0x000'))
    .withTo(Address.fromString('0x000'));

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
    deliverPolicy: DeliverPolicy.New,
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(
      chalk.blue(`Received filtered receipt message: ${msg.subject}`),
    );
    // Here you could add more processing of the filtered receipt message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered receipt'));
