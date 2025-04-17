import { handleUnhandledError } from 'examples/helpers';
import { BlocksSubject, Client, DeliverPolicy, FuelNetwork } from '../../src';

async function main() {
  const connection = await Client.connect(FuelNetwork.Local, 'your_key');
  const subjects = [BlocksSubject.build()];
  const stream = await connection.subscribe(
    subjects,
    DeliverPolicy.fromBlock(0),
  );

  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
  }
}

main().catch(handleUnhandledError('blocks'));
