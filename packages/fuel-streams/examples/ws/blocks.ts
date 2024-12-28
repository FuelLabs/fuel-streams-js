import { handleUnhandledError } from 'examples/helpers';
import { BlocksSubject, Client, DeliverPolicy, FuelNetwork } from '../../src';

async function main() {
  const client = await Client.new(FuelNetwork.Staging);
  const connection = await client.connect();

  const subject = BlocksSubject.build();
  const stream = await connection.subscribe(subject, DeliverPolicy.All);

  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
  }
}

main().catch(handleUnhandledError('blocks'));
