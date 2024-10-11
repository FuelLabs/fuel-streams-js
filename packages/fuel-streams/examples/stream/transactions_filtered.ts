import chalk from 'chalk';
import { Address } from 'fuels';
import {
  Client,
  ClientOpts,
  DeliverPolicy,
  IdentifierKind,
  TransactionStream,
  TransactionsByIdSubject,
} from '../../src';
import { handleUnhandledError, printHeader } from '../helpers';

async function main() {
  printHeader('Filtered Transaction Streams Example');

  const opts = new ClientOpts('testnet');
  const client = await Client.connect(opts);
  const stream = await TransactionStream.init(client);

  // Create a filtered subject
  const filteredSubject = new TransactionsByIdSubject()
    .withIdKind(IdentifierKind.ContractID) // Filter by Address
    .withIdValue('0x0000000000000000000000000000000000000000'); // Replace with an actual address if known

  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
    deliverPolicy: DeliverPolicy.New,
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(
      chalk.blue(`Received filtered transaction message: ${msg.subject}`),
    );
    // Here you could add more processing of the filtered transaction message if needed
  }

  await stream.flushAwait();
}

main().catch(handleUnhandledError('filtered transaction'));
