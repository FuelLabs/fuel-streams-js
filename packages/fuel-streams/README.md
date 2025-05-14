<div align="center">
    <a href="https://github.com/FuelLabs/fuel-streams-js">
        <img src="https://fuellabs.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F9ff3607d-8974-46e8-8373-e2c96344d6ff%2F81a0a0d9-f3c7-4ccb-8af5-40ca8a4140f9%2FFUEL_Symbol_Circle_Green_RGB.png?table=block&id=cb8fc88a-4fc3-4f28-a974-9c318a65a2c6&spaceId=9ff3607d-8974-46e8-8373-e2c96344d6ff&width=2000&userId=&cache=v2" alt="Logo" width="80" height="80">
    </a>
    <h3 align="center">@fuels/streams</h3>
    <p align="center">
        Official data streaming TypeScript library for the Fuel Network
    </p>
    <p align="center">
        <a href="https://github.com/FuelLabs/fuel-streams-js/actions/workflows/pr.yaml/badge.svg?branch=main" style="text-decoration: none;">
            <img src="https://github.com/FuelLabs/fuel-streams-js/actions/workflows/pr.yaml/badge.svg?branch=main" alt="CI">
        </a>
        <a href="https://www.npmjs.com/package/@fuels/streams" style="text-decoration: none;">
            <img src="https://img.shields.io/npm/v/@fuels/streams?label=latest" alt="npm">
        </a>
    </p>
</div>

## 📝 About

The `@fuels/streams` library provides a simple and robust TypeScript SDK for connecting to and consuming real-time data from the Fuel blockchain. It enables developers to subscribe to blockchain events with type-safe interfaces and powerful filtering capabilities.

## 🚀 Features

- **WebSocket-Based Streaming**: Real-time data streaming using WebSocket connections
- **Type-Safe Interfaces**: Full TypeScript support with comprehensive type definitions
- **Flexible Filtering**: Filter blockchain data by various criteria
- **Multiple Data Types**: Support for blocks, transactions, receipts, inputs, outputs, and more
- **Customizable Delivery Policies**: Control how you receive data (new events or from a specific block)
- **ABI-Based Decoding**: Decode contract events using ABI definitions
- **Error Handling**: Comprehensive error handling and reporting

## 📦 Installation

```bash
npm install @fuels/streams
# or
yarn add @fuels/streams
# or
pnpm add @fuels/streams
# or
bun install @fuels/streams
```

## 🛠️ Usage

### Connecting to the Fuel Network

```typescript
import { Client, FuelNetwork } from "@fuels/streams";

async function main() {
  // Connect to the Fuel network with your API key
  const connection = await Client.connect(FuelNetwork.Mainnet, "your_api_key");
  console.log("Connected to Fuel Network");
}

main().catch(console.error);
```

### Subscribing to Blocks

```typescript
import {
  BlocksSubject,
  Client,
  DeliverPolicy,
  FuelNetwork,
} from "@fuels/streams";

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, "your_api_key");

  // Create a subject for all blocks
  const subjects = [BlocksSubject.build()];

  // Subscribe to blocks with new deliver policy
  const stream = await connection.subscribe(subjects, DeliverPolicy.new());

  for await (const message of stream) {
    console.log("Block:", message.payload);
  }
}

main().catch(console.error);
```

### Filtering Transactions

```typescript
import {
  Client,
  DeliverPolicy,
  FuelNetwork,
  TransactionStatus,
  TransactionType,
  TransactionsSubject,
} from "@fuels/streams";

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, "your_api_key");

  // Create a filtered subject for successful script transactions
  const subjects = [
    TransactionsSubject.build({
      txType: TransactionType.Script,
      status: TransactionStatus.Success,
    }),
  ];

  // Subscribe from a specific block height
  const stream = await connection.subscribe(
    subjects,
    DeliverPolicy.fromBlock(1000000),
  );

  for await (const message of stream) {
    console.log("Transaction:", message.payload);
  }
}

main().catch(console.error);
```

### Decoding Contract Events

```typescript
import {
  Client,
  DeliverPolicy,
  FuelNetwork,
  ReceiptsLogDataSubject,
} from "@fuels/streams";

// Import your contract ABI
import contractAbi from "./contract_abi.json";

async function main() {
  // Pass the ABI when connecting
  const connection = await Client.connect(FuelNetwork.Mainnet, "your_api_key", {
    abi: contractAbi,
  });

  // Filter log data from a specific contract
  const subjects = [
    ReceiptsLogDataSubject.build({
      contract:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    }),
  ];

  const stream = await connection.subscribe(subjects, DeliverPolicy.new());

  for await (const message of stream) {
    console.log("Event:", message.payload);
    // The payload will be automatically decoded using the provided ABI
  }
}

main().catch(console.error);
```

### Using Event Handlers

```typescript
import {
  BlocksSubject,
  Client,
  DeliverPolicy,
  FuelNetwork,
} from "@fuels/streams";

async function main() {
  const connection = await Client.connect(FuelNetwork.Mainnet, "your_api_key");

  const subjects = [BlocksSubject.build()];
  const stream = await connection.subscribe(subjects, DeliverPolicy.new());

  // Use event handlers instead of async iteration
  const unsubscribe = stream.onMessage((message) => {
    console.log("New block:", message.payload);
  });

  // Handle errors
  stream.onMessageError((error) => {
    console.error("Stream error:", error);
  });

  // Later, when you want to stop receiving events
  // unsubscribe();
}

main().catch(console.error);
```

## 📊 Available Subjects

The library provides various subject types for different blockchain data:

- **BlocksSubject**: Subscribe to blocks
- **TransactionsSubject**: Subscribe to transactions
- **InputsSubject**: Subscribe to transaction inputs
- **OutputsSubject**: Subscribe to transaction outputs
- **ReceiptsSubject**: Subscribe to transaction receipts
- **PredicatesSubject**: Subscribe to predicate executions
- **UtxosSubject**: Subscribe to UTXOs
- **MessagesSubject**: Subscribe to messages

Each subject type supports specific filter criteria. For a complete list of available filters, see the [Filters List](https://github.com/FuelLabs/fuel-streams-js#filters) in the main repository README.

## 🔄 Delivery Policies

Control how you receive data with delivery policies:

- **DeliverPolicy.new()**: Receive only new data from the point of subscription
- **DeliverPolicy.fromBlock(blockNumber)**: Receive data starting from a specific block height

## 🏗️ Architecture

The library is organized into several key components:

- **Client**: Manages WebSocket connections to the Fuel Network
- **Connection**: Handles the subscription lifecycle and message processing
- **Subjects**: Define what data to subscribe to and how to filter it
- **DeliverPolicy**: Controls the starting point for data delivery
- **Parsers**: Convert raw blockchain data into typed objects

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](https://github.com/FuelLabs/fuel-streams-js/blob/main/CONTRIBUTING.md) for more information.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/FuelLabs/fuel-streams-js/blob/main/LICENSE) file for details.
