import { handleUnhandledError } from 'examples/helpers';
import { BlocksSubject, Client, DeliverPolicy, FuelNetwork } from '../../src';

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, 'your-api-key');
  const subject = BlocksSubject.build();
  const stream = await connection.subscribe(subject, DeliverPolicy.new());

  for await (const message of stream) {
    console.log('Key:', message.key);
    console.log('Data:', message.data);
  }
}

main().catch(handleUnhandledError('blocks'));
