# Fuel Stream TypeScript SDK

The fuels-streams TypeScript SDK provides a simple and robust way to interact with a NATS server, enabling seamless integration of pub/sub patterns, message streaming, and typed data structures. This SDK extends the capabilities of NATS by supporting type-safe interactions and convenient utilities for developers.

---

## Features

- **Typed Pub/Sub:** Publish and subscribe to NATS subjects with strong typing support.
- **Wildcard Filtering:** Consume messages from subjects with wildcards for flexible subscription patterns.
- **Stream Management:** Efficiently handle streaming data with utilities like `BlockStream`.
- **Ease of Use:** Intuitive APIs for initializing clients and managing subjects.

---

## Installation

Install the SDK using npm or yarn:

```bash
npm install @fuels/fuel-streams-js
# or
yarn add @fuelsg/fuel-streams-js
```

---

## Quick Start

### Connecting to NATS

```typescript
import { Client, ClientOpts } from '@fuels/fuel-streams-js';

async function main() {
  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  console.log('Connected to NATS');
}

main().catch(console.error);
```

### Subscribing to Subjects

The SDK allows consuming messages from named NATS subjects. The example below invokes a stream of all Blocks subjects:

```typescript
import { Client, ClientOpts, BlocksSubject, BlockStream } from '@fuels/fuel-streams-js';

async function main() {
  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);
  const subscription = await stream.subscribe(BlocksSubject.all());

  for await (const msg of subscription) {
    console.log(`Received block message: ${msg.key}`);
  }

  await stream.flushAwait();
}

main().catch(console.error);
```

### Filtered Streams

With the sdk one can easily apply filters on the stream. The example below invokes a stream where we only allow block of height 1000 to be streamed:

```typescript
import { BlockStream, BlocksSubject, Client, ClientOpts } from '@fuels/fuel-streams-js';

async function main() {

  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);

  // Create a filtered subject
  const filteredSubject = new BlocksSubject().withHeight(1000);
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(chalk.blue(`Received filtered block message: ${msg.subject}`));
  }

  await stream.flushAwait();
}

main().catch(console.error);

```

## Contributing

We welcome contributions! Please read our contribution guide for details on how to submit issues and pull requests.

---

## License

This project is licensed under the MIT License.
