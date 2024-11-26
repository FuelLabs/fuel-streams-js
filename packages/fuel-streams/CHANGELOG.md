# @fuels/streams

## 0.1.0

### Minor Changes

- [#8](https://github.com/FuelLabs/fuel-streams-js/pull/8) [`81a4fa0`](https://github.com/FuelLabs/fuel-streams-js/commit/81a4fa0c0025b505f5c960ca561deff0501cfe04) Thanks [@pedronauck](https://github.com/pedronauck)! - Improve Stream API and enhance demo application UI

  - **API Changes**:
    - Rename `subscribeWithSubject` to `subscribe` for better API clarity
    - Add `subscribeWithString` method for string-based subscriptions
    - Remove namespace handling from stream creation
    - Improve consumer subscription handling and configuration
    - Update return type for subscriptions to use `ConsumerMessages`
    - Add network selection during client initialization (`{ network: 'testnet' | 'mainnet' }`)
    - Add `switchNetwork` method for dynamic network switching
    - Remove `ClientOpts` requirement for simpler initialization

  ### Client Initialization

  ```typescript
  // Before
  const opts = new ClientOpts();
  const client = await Client.connect(opts);

  // After
  const client = await Client.connect({ network: "testnet" }); // or 'mainnet'
  ```

  ### Stream Subscription

  ```typescript
  // Before
  const stream = await BlocksStream.init(client);
  const subscription = await stream.subscribeWithSubject(subject);

  // After - Using typed subjects
  const stream = await BlocksStream.init(client);
  const subscription = await stream.subscribe(BlocksSubject.build());

  // After - Using string subjects
  const subscription = await stream.subscribeWithString("my-subject");
  ```

  ### Network Switching

  ```typescript
  const client = Client.getInstance();
  await client.switchNetwork("testnet");
  ```

  - **Demo App Improvements**:
    - Add network switching support (mainnet/testnet)
    - Implement new header with navigation and network controls
    - Add toast notifications for network changes
    - Improve UI layout and responsiveness
    - Add loading states and better error handling
    - Enhance code examples visualization
    - Add E2E testing setup with Vitest
    - Improve CI workflows for better test handling
    - Update build and test scripts in Turbo pipeline

## 0.0.2

### Patch Changes

- [`3d8eb44`](https://github.com/FuelLabs/fuel-streams-js/commit/3d8eb44dd5719504b8fb6e632c874995fa55bee9) Thanks [@pedronauck](https://github.com/pedronauck)! - Bumping version only

## 0.0.2

### Patch Changes

- [`3d8eb44`](https://github.com/FuelLabs/fuel-streams-js/commit/3d8eb44dd5719504b8fb6e632c874995fa55bee9) Thanks [@pedronauck](https://github.com/pedronauck)! - Bumping version only
