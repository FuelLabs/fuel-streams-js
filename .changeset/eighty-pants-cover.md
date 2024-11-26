---
"@fuels/streams": minor
---

Improve Stream API and enhance demo application UI

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
