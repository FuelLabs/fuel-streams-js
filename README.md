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

## 🚀 Features

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

## ⚙️ Filters

<!-- start filters list -->

### Block

#### `BlocksSubject`

- `producer (String)`
	- The address of the producer that created the block
- `height (Number)`
	- The height of the block as unsigned 64 bit integer

### Transaction

#### `TransactionsSubject`

- `block_height (Number)`
	- The height of the block containing this transaction
- `tx_id (String)`
	- The ID of the transaction (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `tx_status (String)`
	- The status of the transaction (success, failure, or submitted)
- `kind (String)`
	- The type of transaction (create, mint, script)

### Input

#### `InputsSubject`

- `input_type (String)`
	- The type of input (coin, contract, or message)
- `block_height (Number)`
	- The height of the block containing this input
- `tx_id (String)`
	- The ID of the transaction containing this input (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `input_index (Number)`
	- The index of this input within the transaction

#### `InputsCoinSubject`

- `block_height (Number)`
	- The height of the block containing this coin input
- `tx_id (String)`
	- The ID of the transaction containing this coin input (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `input_index (Number)`
	- The index of this input within the transaction
- `owner (String)`
	- The address of the coin owner (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID of the coin (32 byte string prefixed by 0x)

#### `InputsContractSubject`

- `block_height (Number)`
	- The height of the block containing this contract input
- `tx_id (String)`
	- The ID of the transaction containing this contract input (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `input_index (Number)`
	- The index of this input within the transaction
- `contract (String)`
	- The ID of the contract being called (32 byte string prefixed by 0x)

#### `InputsMessageSubject`

- `block_height (Number)`
	- The height of the block containing this message input
- `tx_id (String)`
	- The ID of the transaction containing this message input (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `input_index (Number)`
	- The index of this input within the transaction
- `sender (String)`
	- The address that sent the message (32 byte string prefixed by 0x)
- `recipient (String)`
	- The address that will receive the message (32 byte string prefixed by 0x)

### Output

#### `OutputsSubject`

- `output_type (String)`
	- The type of output (coin, contract, change, variable, or contract_created)
- `block_height (Number)`
	- The height of the block containing this output
- `tx_id (String)`
	- The ID of the transaction containing this output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction

#### `OutputsCoinSubject`

- `block_height (Number)`
	- The height of the block containing this coin output
- `tx_id (String)`
	- The ID of the transaction containing this coin output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction
- `to (String)`
	- The recipient address of the coin output (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID of the coin (32 byte string prefixed by 0x)

#### `OutputsContractSubject`

- `block_height (Number)`
	- The height of the block containing this contract output
- `tx_id (String)`
	- The ID of the transaction containing this contract output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction
- `contract (String)`
	- The ID of the contract (32 byte string prefixed by 0x)

#### `OutputsChangeSubject`

- `block_height (Number)`
	- The height of the block containing this change output
- `tx_id (String)`
	- The ID of the transaction containing this change output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction
- `to (String)`
	- The recipient address of the change output (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID of the change output (32 byte string prefixed by 0x)

#### `OutputsVariableSubject`

- `block_height (Number)`
	- The height of the block containing this variable output
- `tx_id (String)`
	- The ID of the transaction containing this variable output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction
- `to (String)`
	- The recipient address of the variable output (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID of the variable output (32 byte string prefixed by 0x)

#### `OutputsContractCreatedSubject`

- `block_height (Number)`
	- The height of the block containing this contract creation output
- `tx_id (String)`
	- The ID of the transaction containing this contract creation output (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `output_index (Number)`
	- The index of this output within the transaction
- `contract (String)`
	- The ID of the created contract (32 byte string prefixed by 0x)

### Receipt

#### `ReceiptsSubject`

- `receipt_type (String)`
	- The type of receipt
- `block_height (Number)`
	- The height of the block containing this receipt
- `tx_id (String)`
	- The ID of the transaction containing this receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction

#### `ReceiptsCallSubject`

- `block_height (Number)`
	- The height of the block containing this call receipt
- `tx_id (String)`
	- The ID of the transaction containing this call receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `from (String)`
	- The contract ID that initiated the call (32 byte string prefixed by 0x)
- `to (String)`
	- The contract ID that was called (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID involved in the call (32 byte string prefixed by 0x)

#### `ReceiptsReturnSubject`

- `block_height (Number)`
	- The height of the block containing this return receipt
- `tx_id (String)`
	- The ID of the transaction containing this return receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that returned (32 byte string prefixed by 0x)

#### `ReceiptsReturnDataSubject`

- `block_height (Number)`
	- The height of the block containing this return data receipt
- `tx_id (String)`
	- The ID of the transaction containing this return data receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that returned data (32 byte string prefixed by 0x)

#### `ReceiptsPanicSubject`

- `block_height (Number)`
	- The height of the block containing this panic receipt
- `tx_id (String)`
	- The ID of the transaction containing this panic receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that panicked (32 byte string prefixed by 0x)

#### `ReceiptsRevertSubject`

- `block_height (Number)`
	- The height of the block containing this revert receipt
- `tx_id (String)`
	- The ID of the transaction containing this revert receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that reverted (32 byte string prefixed by 0x)

#### `ReceiptsLogSubject`

- `block_height (Number)`
	- The height of the block containing this log receipt
- `tx_id (String)`
	- The ID of the transaction containing this log receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that emitted the log (32 byte string prefixed by 0x)

#### `ReceiptsLogDataSubject`

- `block_height (Number)`
	- The height of the block containing this log data receipt
- `tx_id (String)`
	- The ID of the transaction containing this log data receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that emitted the log data (32 byte string prefixed by 0x)

#### `ReceiptsTransferSubject`

- `block_height (Number)`
	- The height of the block containing this transfer receipt
- `tx_id (String)`
	- The ID of the transaction containing this transfer receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `from (String)`
	- The contract ID that initiated the transfer (32 byte string prefixed by 0x)
- `to (String)`
	- The contract ID that received the transfer (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID being transferred (32 byte string prefixed by 0x)

#### `ReceiptsTransferOutSubject`

- `block_height (Number)`
	- The height of the block containing this transfer out receipt
- `tx_id (String)`
	- The ID of the transaction containing this transfer out receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `from (String)`
	- The contract ID that initiated the transfer out (32 byte string prefixed by 0x)
- `to_address (String)`
	- The address that received the transfer (32 byte string prefixed by 0x)
- `asset (String)`
	- The asset ID being transferred (32 byte string prefixed by 0x)

#### `ReceiptsScriptResultSubject`

- `block_height (Number)`
	- The height of the block containing this script result receipt
- `tx_id (String)`
	- The ID of the transaction containing this script result receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction

#### `ReceiptsMessageOutSubject`

- `block_height (Number)`
	- The height of the block containing this message out receipt
- `tx_id (String)`
	- The ID of the transaction containing this message out receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `sender (String)`
	- The address that sent the message (32 byte string prefixed by 0x)
- `recipient (String)`
	- The address that will receive the message (32 byte string prefixed by 0x)

#### `ReceiptsMintSubject`

- `block_height (Number)`
	- The height of the block containing this mint receipt
- `tx_id (String)`
	- The ID of the transaction containing this mint receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that performed the mint (32 byte string prefixed by 0x)
- `sub_id (String)`
	- The sub identifier of the minted asset (32 byte string prefixed by 0x)

#### `ReceiptsBurnSubject`

- `block_height (Number)`
	- The height of the block containing this burn receipt
- `tx_id (String)`
	- The ID of the transaction containing this burn receipt (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `receipt_index (Number)`
	- The index of this receipt within the transaction
- `contract (String)`
	- The ID of the contract that performed the burn (32 byte string prefixed by 0x)
- `sub_id (String)`
	- The sub identifier of the burned asset (32 byte string prefixed by 0x)

### Utxo

#### `UtxosSubject`

- `block_height (Number)`
	- The height of the block containing this UTXO
- `tx_id (String)`
	- The ID of the transaction containing this UTXO (32 byte string prefixed by 0x)
- `tx_index (Number)`
	- The index of the transaction within the block
- `input_index (Number)`
	- The index of the input within the transaction
- `utxo_type (String)`
	- The type of UTXO (coin, message, or contract)
- `utxo_id (String)`
	- The unique identifier for this UTXO (32 byte string prefixed by 0x)

<!-- end filters list -->

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For more information on contributing, please see our [Contributing Guidelines](CONTRIBUTING.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
