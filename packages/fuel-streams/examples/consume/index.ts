/* eslint-disable @typescript-eslint/no-var-requires */
import 'dotenv/config';
import {
  type ConnectionOptions,
  Empty,
  usernamePasswordAuthenticator,
} from '@nats-io/nats-core';
// import { NatsConnectionImpl } from "@nats-io/nats-core";
import { connect } from '@nats-io/transport-node';
import chalk from 'chalk';

// require('dotenv').config({
//   path: path.resolve(__dirname, '..', '.env'),
// });

(async () => {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(`${chalk.green.bold('Consumer Example')}`);
  console.log(header);

  try {
    const authenticator = usernamePasswordAuthenticator('admin', 'secret');
    const nc = await connect({
      servers: '127.0.0.1:4222',
      timeout: 30000,
      authenticator,
      maxReconnectAttempts: 3,
    } as ConnectionOptions);
    console.info(`connected to ${nc.getServer()}`);

    await nc.flush();
    await nc.close();

    process.exit(0);
  } catch (ex) {
    console.error(ex);
    const msg = chalk.red(`Error = ${ex}`);
    console.error(msg);
    process.exit(-1);
  }
})();
