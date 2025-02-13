import fs from 'node:fs';
const pkg = JSON.parse(
  fs.readFileSync('./packages/fuel-streams/package.json', 'utf8'),
);

const publishConfig = pkg.publishConfig;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.publishConfig;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.main;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.module;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.types;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.exports;
// biome-ignore lint/performance/noDelete: <explanation>
delete pkg.typesVersions;

const newPackageJson = {
  ...pkg,
  ...publishConfig,
};

fs.writeFileSync(
  './packages/fuel-streams/package.json',
  JSON.stringify(newPackageJson, null, 2),
);
