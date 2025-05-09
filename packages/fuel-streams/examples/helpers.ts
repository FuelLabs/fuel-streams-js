import chalk from 'chalk';

export const NATS_URL_TESTNET = 'nats://stream-testnet.fuel.network:4222';

export function printHeader(title: string) {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(chalk.green.bold(title));
  console.log(header);
}

export function handleUnhandledError(streamType: string) {
  return (error: any) => {
    console.error(
      chalk.red(`Unhandled error in ${streamType} stream main function:`),
    );
    console.error(error);
    process.exit(1);
  };
}
