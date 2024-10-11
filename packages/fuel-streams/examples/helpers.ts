import chalk from 'chalk';

export function printHeader(title: string) {
  const header = '='.repeat(process.stdout.columns - 1);
  console.log(header);
  console.log(chalk.green.bold(title));
  console.log(header);
}

export function handleUnhandledError(streamType: string) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (error: any) => {
    console.error(
      chalk.red(`Unhandled error in ${streamType} stream main function:`),
    );
    console.error(error);
    process.exit(1);
  };
}
