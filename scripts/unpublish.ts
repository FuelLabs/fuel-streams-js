import { exec } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { compare } from 'compare-versions';

const execAsync = promisify(exec);

interface PackageJson {
  name: string;
  private?: boolean;
  version: string;
}

const TAGS_TO_DELETE = /next|preview|rc|main/;
const DELETE_MODE = process.env.DELETE_PACKAGES === 'true';
const VERSIONS_TO_DELETE = process.env.VERSION_TO_DELETE
  ? process.env.VERSION_TO_DELETE.split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  : [];

/**
 * Formats a package name and version for logging
 */
const formatPackageVersion = (name: string, version: string): string =>
  chalk.cyan(`${name}@${version}`);

/**
 * Logs a section header
 */
const logSection = (title: string): void => {
  console.log(`\n${chalk.bold.blue('='.repeat(50))}`);
  console.log(chalk.bold.blue(title));
  console.log(`${chalk.bold.blue('='.repeat(50))}\n`);
};

/**
 * Logs a success message
 */
const logSuccess = (message: string): void =>
  console.log(chalk.green('✓'), message);

/**
 * Logs an error message
 */
const logError = (message: string, error?: Error): void => {
  console.log(chalk.red('✗'), message);
  if (error) console.log(chalk.red('Error:'), error.message);
};

/**
 * Gets all public packages from the packages directory
 */
async function getPublicPackages(): Promise<string[]> {
  const packages = await readdir(join(__dirname, '../packages'), {
    withFileTypes: true,
  });

  const packagesNames = await Promise.all(
    packages.map(async (pkg) => {
      try {
        const packagePath = join(
          __dirname,
          '../packages',
          pkg.name,
          'package.json',
        );
        const packageContent = await readFile(packagePath, 'utf8');
        const { name, private: isPrivate } = JSON.parse(
          packageContent,
        ) as PackageJson;
        return isPrivate ? null : name;
      } catch {
        return null;
      }
    }),
  );

  return packagesNames.filter(Boolean) as string[];
}

/**
 * Gets all versions that should be deleted for a package
 */
async function getVersionsToDelete(packageName: string): Promise<string[]> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  const { versions } = (await response.json()) as {
    versions: Record<string, unknown>;
  };
  const availableVersions = Object.keys(versions);

  console.log('Available versions:', chalk.gray(availableVersions.join(', ')));

  if (VERSIONS_TO_DELETE.length) {
    return availableVersions.filter((v) => VERSIONS_TO_DELETE.includes(v));
  }

  const { version: currentVersion } =
    require('../packages/fuel-streams/package.json') as PackageJson;

  return availableVersions.filter(
    (version) =>
      version.search(TAGS_TO_DELETE) > -1 &&
      !compare(version, currentVersion, '>='),
  );
}

/**
 * Unpublishes a specific version of a package using npm CLI
 */
async function unpublishVersion(
  packageName: string,
  version: string,
): Promise<void> {
  const packageVersion = formatPackageVersion(packageName, version);
  console.log(chalk.yellow('\n→ Deleting'), packageVersion);

  try {
    // Try unpublishing with different flags
    const command = `npm unpublish "${packageName}@${version}" --force --registry https://registry.npmjs.org/`;
    console.log('Running command:', command);

    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('WARN')) console.log(stderr);

    // Wait for registry to process the deletion
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify deletion
    const checkResponse = await fetch(
      `https://registry.npmjs.org/${packageName}/${version}`,
      { cache: 'no-store' },
    );

    if (checkResponse.status === 404) {
      logSuccess(`Successfully deleted ${packageVersion}`);
    } else {
      throw new Error('Package version still exists after unpublish attempt');
    }
  } catch (error) {
    logError(`Failed to delete ${packageVersion}`, error as Error);
  }
}

async function main(): Promise<void> {
  logSection('NPM Package Version Cleanup');
  const { version: currentVersion } =
    require('../packages/fuel-streams/package.json') as PackageJson;
  console.log('Current version:', chalk.cyan(currentVersion));
  console.log(
    'Delete mode:',
    DELETE_MODE ? chalk.green('enabled') : chalk.red('disabled'),
  );

  if (VERSIONS_TO_DELETE.length) {
    console.log(
      'Target versions:',
      chalk.yellow(VERSIONS_TO_DELETE.join(', ')),
    );
  }

  if (!DELETE_MODE) {
    logError('Delete mode is disabled. Enable it to delete packages.');
    return;
  }

  const packages = await getPublicPackages();
  console.log('\nFound packages:', chalk.cyan(packages.join(', ')));

  for (const packageName of packages) {
    logSection(`Processing ${chalk.bold(packageName)}`);

    const versionsToDelete = await getVersionsToDelete(packageName);

    if (!versionsToDelete.length) {
      console.log(chalk.yellow('No matching versions found to delete'));
      continue;
    }

    console.log('\nVersions to delete:');
    versionsToDelete.forEach((v) =>
      console.log(chalk.yellow('•'), formatPackageVersion(packageName, v)),
    );

    for (const version of versionsToDelete) {
      await unpublishVersion(packageName, version);
    }
  }
}

main()
  .then(() => logSuccess('All packages processed successfully'))
  .catch((error: Error) => {
    logError('Script failed', error);
    process.exit(1);
  });
