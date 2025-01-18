import { handleUnhandledError } from 'examples/helpers';
import { BlocksSubject, Client, DeliverPolicy, FuelNetwork } from '../../src';

async function main() {
  const connection = await Client.connect(FuelNetwork.Staging, 'your-api-key');
  const subject = BlocksSubject.build();
  const stream = await connection.subscribe(subject, DeliverPolicy.new());

  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
  }
}

main().catch(handleUnhandledError('blocks'));
