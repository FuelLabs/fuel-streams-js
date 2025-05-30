import { FuelNetwork } from './types';

export function getNetworkFromEnv(): FuelNetwork {
  const network = process.env.NETWORK;
  switch (network) {
    case 'testnet':
      return FuelNetwork.Testnet;
    case 'mainnet':
      return FuelNetwork.Mainnet;
    case 'staging':
      return FuelNetwork.Staging;
    default:
      return FuelNetwork.Local;
  }
}

export function getWsUrl(network: FuelNetwork): URL {
  switch (network) {
    case FuelNetwork.Local:
      return new URL('ws://0.0.0.0:9003');
    case FuelNetwork.Staging:
      return new URL('wss://stream-staging.fuel.network');
    case FuelNetwork.Testnet:
      return new URL('wss://stream-testnet.fuel.network');
    case FuelNetwork.Mainnet:
      return new URL('wss://stream-mainnet.fuel.network');
  }
}
