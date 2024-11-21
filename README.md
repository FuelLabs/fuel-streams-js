<div align="center">
    <a href="https://github.com/FuelLabs/fuel-streams-js">
        <img src="https://global.discourse-cdn.com/business6/uploads/fuel/original/2X/5/57d5a345cc15a64b636e0d56e042857f8a0e80b1.png" alt="Logo" width="80" height="80">
    </a>
    <h3 align="center">Fuel Streams TypeScript SDK</h3>
    <p align="center">
        A TypeScript SDK for working with streams of Fuel blockchain data
    </p>
    <p align="center">
        <a href="https://github.com/FuelLabs/fuel-streams-js/actions" style="text-decoration: none;">
            <img src="https://github.com/FuelLabs/fuel-streams-js/actions/workflows/ci.yaml/badge.svg?branch=main" alt="CI">
        </a>
        <a href="https://www.npmjs.com/package/@fuels/streams" style="text-decoration: none;">
            <img src="https://img.shields.io/npm/v/@fuels/streams?label=latest" alt="npm">
        </a>
    </p>
    <p align="center">
        <a href="https://docs.fuel.network/docs/streams">📚 Documentation</a>
        <span>&nbsp;</span>
        <a href="https://github.com/FuelLabs/fuel-streams-js/issues/new?labels=bug&template=bug-report---.md">🐛 Report Bug</a>
        <span>&nbsp;</span>
        <a href="https://github.com/FuelLabs/fuel-streams-js/issues/new?labels=enhancement&template=feature-request---.md">✨ Request Feature</a>
    </p>
</div>

## 📝 About The Project

> [!WARNING]
> This project is currently under development and is not yet ready for production use.

The Fuel Streams TypeScript SDK provides a simple and robust way to interact with a NATS server, enabling seamless integration of pub/sub patterns, message streaming, and typed data structures. This SDK extends the capabilities of NATS by supporting type-safe interactions and convenient utilities for developers.

## 🚀 Features

- **Typed Pub/Sub:** Publish and subscribe to NATS subjects with strong typing support
- **Wildcard Filtering:** Consume messages from subjects with wildcards for flexible subscription patterns
- **Stream Management:** Efficiently handle streaming data with utilities like `BlockStream`
- **Ease of Use:** Intuitive APIs for initializing clients and managing subjects
- **Type Safety:** Full TypeScript support with typed data structures
- **Multiple Stream Types:** Support for blocks, transactions, receipts, inputs, outputs, and logs

## 🛠 Installation

Install the SDK using npm, yarn, or pnpm:

```bash
npm install @fuels/streams
# or
yarn add @fuels/streams
# or
pnpm add @fuels/streams
```

## 📊 Usage

Here are some examples to get you started with the Fuel Streams TypeScript SDK:

### Connecting to NATS

```typescript
import { Client, ClientOpts } from '@fuels/streams';

async function main() {
  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  console.log('Connected to NATS');
}

main().catch(console.error);
```

### Subscribing to Blocks

```typescript
import { Client, ClientOpts, BlocksSubject, BlockStream } from '@fuels/streams';

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

```typescript
import { BlockStream, BlocksSubject, Client, ClientOpts } from '@fuels/streams';

async function main() {
  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await BlockStream.init(client);

  // Create a filtered subject for blocks at height 1000
  const filteredSubject = new BlocksSubject().withHeight(1000);
  const consumer = await stream.subscribeConsumer({
    filterSubjects: [filteredSubject],
  });

  const iter = await consumer.consume({ max_messages: 10 });
  for await (const msg of iter) {
    console.log(`Received filtered block message: ${msg.subject}`);
  }

  await stream.flushAwait();
}

main().catch(console.error);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For more information on contributing, please see our [Contributing Guidelines](CONTRIBUTING.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
