import dotenv from 'dotenv';
import { handleUnhandledError } from 'examples/helpers';
import {
  Client,
  DeliverPolicy,
  FuelNetwork,
  type RawReceipt,
  ReceiptType,
  ReceiptsLogDataSubject,
} from '../../src';

import miraAbiJson from './mira_abi.json';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const MIRA_CONTRACT_ID =
  '0x2e40f2b244b98ed6b8204b3de0156c6961f98525c8162f80162fcf53eebd90e7';

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, API_KEY, {
    abi: miraAbiJson,
  });

  const subjects = [
    ReceiptsLogDataSubject.build({
      contract: MIRA_CONTRACT_ID,
    }),
  ];

  const deliverPolicy = DeliverPolicy.fromBlock(0);
  const stream = await connection.subscribe(subjects, deliverPolicy);
  for await (const message of stream) {
    console.log('Subject:', message.subject);
    console.log('Payload:', message.payload);
    const receipt = message.payload as unknown as RawReceipt;
    if (receipt.type === ReceiptType.LogData) {
      console.log('Data:', receipt.data);
    }
  }
}

main().catch(handleUnhandledError('transactions'));
