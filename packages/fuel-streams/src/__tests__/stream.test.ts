// import { BlocksStream } from 'src/modules/blocks';
// import { Client } from 'src/nats-client';
// import type { Stream } from 'src/stream';
// import type { Block, RawBlock } from 'src/types';
// import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// // Mock the Stream class
// vi.mock('src/stream', () => ({
//   Stream: {
//     get: vi.fn().mockImplementation(async (client, bucketName) => {
//       const streamName = client.opts.streamName(bucketName);
//       const mockAsyncIterator = {
//         async *[Symbol.asyncIterator]() {
//           yield { json: () => ({ data: 'test' }) };
//         },
//       };
//       const mockStore = {
//         status: vi.fn().mockResolvedValue({
//           streamInfo: { state: { messages: 10 } },
//         }),
//       };
//       return {
//         getStreamName: vi.fn().mockResolvedValue(streamName),
//         getStore: vi.fn().mockReturnValue(mockStore),
//         subscribeWithString: vi.fn().mockResolvedValue(mockAsyncIterator),
//         subscribeConsumer: vi.fn().mockResolvedValue({
//           consume: vi.fn().mockReturnValue(mockAsyncIterator),
//         }),
//         createConsumer: vi.fn().mockResolvedValue({
//           consume: vi.fn().mockReturnValue(mockAsyncIterator),
//         }),
//         flushAwait: vi.fn().mockResolvedValue(undefined),
//         getConsumersAndState: vi.fn().mockResolvedValue({
//           streamName,
//           consumers: [{ name: 'consumer1' }],
//           state: { messages: 10 },
//         }),
//       };
//     }),
//   },
// }));

// // Mock the Client class
// vi.mock('src/nats-client', () => ({
//   Client: {
//     connect: vi.fn().mockResolvedValue({
//       closeSafely: vi.fn().mockResolvedValue(undefined),
//       getOrCreateKvStore: vi.fn().mockResolvedValue({
//         status: vi.fn().mockResolvedValue({
//           streamInfo: { state: { messages: 10 } },
//         }),
//       }),
//       opts: {
//         streamName: (name: string) => `fuel_${name}`,
//         getNamespace: () => 'fuel',
//       },
//       jetStreamManager: {
//         consumers: {
//           list: vi.fn().mockReturnValue([{ name: 'consumer1' }]),
//         },
//       },
//       jetStream: {
//         consumers: {
//           getPushConsumer: vi.fn().mockResolvedValue({
//             consume: vi.fn().mockReturnValue({
//               async *[Symbol.asyncIterator]() {
//                 yield { json: () => ({ data: 'test' }) };
//               },
//             }),
//           }),
//         },
//       },
//     }),
//   },
// }));

// describe('Stream', () => {
//   let client: Client;
//   let stream: Stream<Block, RawBlock>;

//   beforeEach(async () => {
//     client = await Client.connect({ network: 'testnet' });
//     stream = await BlocksStream.init(client);
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   it('should initialize a new stream', async () => {
//     expect(await stream.getStreamName()).toBe('fuel_blocks');
//   });

//   it('should get the store instance', () => {
//     const store = stream.getStore();
//     expect(store).toBeDefined();
//     expect(store.status).toBeDefined();
//   });

//   it('should subscribe to a string subject', async () => {
//     const subscription = await stream.subscribeWithString('test-subject');
//     expect(subscription).toBeDefined();

//     for await (const msg of subscription) {
//       expect(msg).toEqual({ data: 'test' });
//       break;
//     }
//   });

//   it('should create a consumer with config', async () => {
//     const consumer = await stream.createConsumer({
//       filter_subjects: ['test-subject'],
//     });
//     expect(consumer).toBeDefined();

//     const messages = await consumer.consume();
//     for await (const msg of messages) {
//       expect(msg.json()).toEqual({ data: 'test' });
//       break;
//     }
//   });

//   it('should get consumers and state information', async () => {
//     const { streamName, consumers, state } =
//       await stream.getConsumersAndState();
//     expect(streamName).toBe('fuel_blocks');
//     expect(consumers).toHaveLength(1);
//     expect(consumers[0].name).toBe('consumer1');
//     expect(state.messages).toBe(10);
//   });

//   it('should flush and close safely', async () => {
//     await expect(stream.flushAwait()).resolves.toBeUndefined();
//   });

//   it('should subscribe with consumer config', async () => {
//     const subscription = await stream.subscribeConsumer({
//       filterSubjects: ['test-subject'],
//     });
//     expect(subscription).toBeDefined();

//     for await (const data of subscription) {
//       expect(data).toEqual({ data: 'test' });
//       break;
//     }
//   });
// });
