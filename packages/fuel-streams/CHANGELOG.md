# @fuels/streams

## 0.9.1

### Patch Changes

- [#47](https://github.com/FuelLabs/fuel-streams-js/pull/47) [`70a29b2`](https://github.com/FuelLabs/fuel-streams-js/commit/70a29b23ca0c6a69fb8dd9932fdd6da7155e23c6) Thanks [@luizstacio](https://github.com/luizstacio)! - Add support for testnet network

## 0.9.0

### Minor Changes

- [`ee48a51`](https://github.com/FuelLabs/fuel-streams-js/commit/ee48a5102c8e97df475e95936de62f50dd352c8c) Thanks [@pedronauck](https://github.com/pedronauck)! - Feat: add messages

## 0.8.0

### Minor Changes

- [`58390e6`](https://github.com/FuelLabs/fuel-streams-js/commit/58390e67471b14f9df5c63d5530e4aab1387195e) Thanks [@pedronauck](https://github.com/pedronauck)! - Feat: adjustments for the new data

## 0.7.1

### Patch Changes

- [`45d016e`](https://github.com/FuelLabs/fuel-streams-js/commit/45d016ec2574a825d73f83cc9cd83f618db2ca8e) Thanks [@pedronauck](https://github.com/pedronauck)! - Fix: publish config for release

## 0.7.0

### Minor Changes

- [`391b93f`](https://github.com/FuelLabs/fuel-streams-js/commit/391b93fe280608a6b9d241b66132ebb75bfebd70) Thanks [@pedronauck](https://github.com/pedronauck)! - Fix: release automated process
- [`fc1bcf0 `](https://github.com/FuelLabs/fuel-streams-js/commit/fc1bcf07ccdd15739cd90d818a48f90c839b62dd) Thanks [@pedronauck](https://github.com/pedronauck)! - Feat: add support for multiple subscription

## 0.5.2

### Patch Changes

- [`0572f87`](https://github.com/FuelLabs/fuel-streams-js/commit/0572f873fcd7653cd60f307d77521c04438ba591) Thanks [@pedronauck](https://github.com/pedronauck)! - fix: minor adjuments on simple demo app

## 0.5.1

### Patch Changes

- [`f77da27`](https://github.com/FuelLabs/fuel-streams-js/commit/f77da278bbbf6dccba2f9d7908b6b7bd1ef51dde) Thanks [@pedronauck](https://github.com/pedronauck)! - Fix: websocket cross-platform implementation

## 0.5.0

### Minor Changes

- [`2363884`](https://github.com/FuelLabs/fuel-streams-js/commit/2363884c8066b2a3c43dcaf8f6c2e25e9e536f27) Thanks [@pedronauck](https://github.com/pedronauck)! - fix: adjust client to work with mainnet and new structure

## 0.4.0

### Minor Changes

- [`a9e92e4`](https://github.com/FuelLabs/fuel-streams-js/commit/a9e92e487fe79b35bca661310437d7bcafd0f1bc) Thanks [@pedronauck](https://github.com/pedronauck)! - feat: Adapt to work with the new WebServer API

## 0.3.1

### Patch Changes

- [`839f737`](https://github.com/FuelLabs/fuel-streams-js/commit/839f737f468f5b991dbbe940df3a578465125227) Thanks [@pedronauck](https://github.com/pedronauck)! - Fix: adjusting release with changeset

## 0.3.0

### Minor Changes

- [`60ca003`](https://github.com/FuelLabs/fuel-streams-js/commit/60ca00331f198797deca343f523cb472a9dc2f89) Thanks [@pedronauck](https://github.com/pedronauck)! - Fix: bumping release for changeset

## 0.2.0

### Minor Changes

- [`69c0f69`](https://github.com/FuelLabs/fuel-streams-js/commit/69c0f692707fd13f40a39afb89f690a79105ec1e) Thanks [@pedronauck](https://github.com/pedronauck)! - Feat: add compatibility with fuels sdk types

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
