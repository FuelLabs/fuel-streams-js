/* eslint-disable @typescript-eslint/no-var-requires */
import 'dotenv/config';
import {
  JetStreamPublishOptions,
  jetstream,
  jetstreamManager,
} from '@nats-io/jetstream';
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

    // let counter = 0;
    // for await (const s of nc.status()) {
    //   counter++;
    //   console.info(`${counter} ${s.type}: ${JSON.stringify(s.data)}`);
    // }

    const _js = jetstream(nc);

    // const x = await js.publish("ORDERS.new", Empty, { headers: { "X-Sequence": "1", }, msgID: 'x' } as JetStreamPublishOptions);

    const jsm = await jetstreamManager(nc);

    for await (const s of jsm.streams.list()) {
      console.log('Stream', s);

      // list all consumers for a stream:
      const consumers = await jsm.consumers.list(s.config.name).next();
      consumers.forEach((ci) => {
        console.log('Got stream 1', ci);
      });

      for (const ss of await jsm.consumers.list(s.config.name).next()) {
        console.log('Got stream 2', ss);
      }

      // for each stream print the consumers
      for await (const c of jsm.consumers.list(s.config.name)) {
        console.log('Consumer ', c);

        // consumer info
        const info = await jsm.consumers.info(s.config.name, c.name);
        console.log('Consumer Info ', info);

        // get consumer
        // const consumer = await js.consumers.get(s.config.name, c.name);
        // const singleMessage = await consumer.next();
        // if (singleMessage) {
        //   console.log(singleMessage);
        //   singleMessage.ack();
        // } else {
        //   console.log(`didn't get a message`);
        // }
      }
    }

    // const myStream = (await jsm.streams.list().next()).at(0);
    // const s = await jsm.streams.get(myStream?.config.name);s.
    // if (myStream) {
    //   while(true) {
    //     const consumer = await js.consumers.get(myStream?.config.name, c.name);
    //     const messages = await consumer.consume({callback: (err, msg) => {}});
    //     for await (const m of messages) {
    //       console.log("Message ", m);
    //       m.ack();
    //     }
    //   }
    // }

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
