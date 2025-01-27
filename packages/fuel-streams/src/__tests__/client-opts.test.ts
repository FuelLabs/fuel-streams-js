// import { ClientOpts, Network } from 'src/client-opts';
// import { describe, expect, it } from 'vitest';

// describe('ClientOpts', () => {
//   describe('constructor', () => {
//     it('should create instance with mainnet network', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.getNetwork()).toBe(Network.mainnet);
//     });

//     it('should create instance with testnet network', () => {
//       const opts = new ClientOpts(Network.testnet);
//       expect(opts.getNetwork()).toBe(Network.testnet);
//     });
//   });

//   describe('getProviderUrl', () => {
//     it('should return mainnet URL when network is mainnet', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.getProviderUrl()).toBe('wss://stream-mainnet.fuel.network:8443');
//     });

//     it('should return testnet URL when network is testnet', () => {
//       const opts = new ClientOpts(Network.testnet);
//       expect(opts.getProviderUrl()).toBe(
//         'wss://stream-testnet.fuel.network:8443',
//       );
//     });
//   });

//   describe('getTimeoutSecs', () => {
//     it('should return default timeout', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.getTimeoutSecs()).toBe(5);
//     });
//   });

//   describe('subjectName', () => {
//     it('should return subject name with namespace', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.subjectName('test')).toBe('fuel.test');
//     });
//   });

//   describe('streamName', () => {
//     it('should return stream name with namespace', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.streamName('test')).toBe('fuel_test');
//     });
//   });

//   describe('getNamespace', () => {
//     it('should return default namespace', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       expect(opts.getNamespace()).toBe('fuel');
//     });
//   });

//   describe('connectOpts', () => {
//     it('should return connection options with correct configuration', () => {
//       const opts = new ClientOpts(Network.mainnet);
//       const connectOpts = opts.connectOpts();

//       expect(connectOpts).toEqual({
//         servers: 'wss://stream-mainnet.fuel.network:8443',
//         timeout: 5000,
//         authenticator: expect.any(Function),
//         maxReconnectAttempts: -1,
//         reconnect: true,
//         reconnectTimeWait: 2000,
//         maxReconnectTimeWait: 10000,
//         waitOnFirstConnect: true,
//         pingInterval: 10000,
//         maxPingOut: 3,
//         noEcho: true,
//       });
//     });

//     it('should return connection options with correct testnet URL', () => {
//       const opts = new ClientOpts(Network.testnet);
//       const connectOpts = opts.connectOpts();
//       expect(connectOpts.servers).toBe(
//         'wss://stream-testnet.fuel.network:8443',
//       );
//     });
//   });

//   describe('static methods', () => {
//     describe('connId', () => {
//       it('should return connection ID with random number', () => {
//         const connId = ClientOpts.connId();
//         expect(connId).toMatch(/^connection-\d+$/);
//       });
//     });

//     describe('randomInt', () => {
//       it('should return number between 0 and 1000000', () => {
//         const num = ClientOpts.randomInt();
//         expect(num).toBeGreaterThanOrEqual(0);
//         expect(num).toBeLessThan(1000000);
//       });
//     });
//   });
// });
