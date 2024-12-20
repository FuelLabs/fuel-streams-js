import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import v from 'voca';
import { $ } from 'zx';
import { subjectsDefinitions } from '../packages/fuel-streams/src/subjects-def';

const program = new Command();

program
  .name('generate-subjects')
  .description('Generate subject files for Fuel Streams')
  .option(
    '-o, --output <path>',
    'output directory for generated files',
    'packages/fuel-streams/src/data',
  )
  .addHelpText(
    'after',
    `
Example calls:
  $ generate-subjects --output ./custom/output/dir
  $ generate-subjects -o ./src/data`,
  )
  .parse();

const options = program.opts();
const OUTPUT_DIR = path.join(process.cwd(), options.output);

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

function generateSubjectBase() {
  return `/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 */

import v from 'voca';

export abstract class SubjectBase<TFields extends Record<string, unknown>> {
  constructor(protected fields: Partial<TFields> = {}) {}
  protected abstract format: string;

  parse(): string {
    const fields = Object.entries(this.fields).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = value?.toString() ?? '*';
        return acc;
      },
      {}
    );

    return this.format.replace(
      /\\{([^}]+)\\}/g,
      (_, key: string) => fields[v.camelCase(key)] ?? '*'
    );
  }

  build(fields: Partial<TFields>): this {
    this.fields = { ...this.fields, ...fields };
    return this;
  }

  static build<T extends SubjectBase<Record<string, unknown>>>(
    this: new () => T,
    fields: Partial<Parameters<T['build']>[0]> = {}
  ): T {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().build(fields);
  }

  static wildcard<T extends SubjectBase<Record<string, unknown>>>(
    this: new () => T
  ): string {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this().parse();
  }
}`;
}

function generateStream(moduleName: string) {
  const pascalModuleName = v.capitalize(moduleName);
  const streamName = `${pascalModuleName}Stream`;
  const payloadType = pascalModuleName.slice(0, pascalModuleName.length - 1);

  return `import type { Client } from '../../nats-client';
import { Stream } from '../../stream';
import { StreamNames, type ${payloadType}, type Raw${payloadType} } from '../../types';
import { ${payloadType}Parser } from '../../parsers';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ${streamName} {
  static async init(client: Client) {
    const parser = new ${payloadType}Parser();
    return Stream.get<${payloadType}, Raw${payloadType}>(
      client,
      StreamNames.${pascalModuleName},
      parser,
    );
  }
}`;
}

function mapRustTypeToTS(rustType: string): string {
  const typeMap: Record<string, string> = {
    B256: 'Bytes32',
    usize: 'number',
    u8: 'number',
    u16: 'number',
    u32: 'number',
    u64: 'number',
  };

  return typeMap[rustType] || rustType;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateInterface(name: string, initFields: Record<string, any>) {
  const fields = Object.entries(initFields)
    .map(([key, value]) => {
      const camelKey = v.camelCase(key);
      return `  ${camelKey}: ${mapRustTypeToTS(value.type)};`;
    })
    .join('\n');

  return `type ${name}Fields = {
${fields}
}`;
}

function generateSubjectClass(name: string, format: string, isGeneric = false) {
  const className = `${name}Subject`;
  const interfaceName = `${name}Fields`;

  if (isGeneric) {
    return `export class ${className} extends SubjectBase<${interfaceName}> {
  protected format = '${format}';
}`;
  }

  return `export class ${className} extends SubjectBase<${interfaceName}> {
  protected format = '${format}';
}`;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getUsedTypes(fields: Record<string, any>): Set<string> {
  const usedTypes = new Set<string>();

  Object.values(fields).forEach((value) => {
    const mappedType = mapRustTypeToTS(value.type);
    if (
      [
        'Address',
        'AssetId',
        'BlockHeight',
        'Bytes32',
        'ContractId',
        'IdentifierKind',
        'TransactionStatus',
        'TransactionKind',
        'MessageId',
        'UtxoType',
      ].includes(mappedType)
    ) {
      usedTypes.add(mappedType);
    }
  });

  return usedTypes;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function generateModuleSubjects(_moduleName: string, moduleConfig: any) {
  // Generate list of subjects in this file
  const subjectNames: string[] = [];
  if ('variants' in moduleConfig) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Object.values(moduleConfig.variants).forEach((variant: any) => {
      const baseName = v.replaceAll(variant.subject, 'Subject', '');
      subjectNames.push(`${baseName}Subject`);
    });
  } else {
    const baseName = v.replaceAll(moduleConfig.subject, 'Subject', '');
    subjectNames.push(`${baseName}Subject`);
  }

  // Generate header comment
  let content = `/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 * 
 * Generated Subjects:
 ${subjectNames.map((name) => ` * - ${name}`).join('\n')}
 */\n\n`;

  content += `import { SubjectBase } from '../subject-base';\n`;

  // Collect all used types
  const usedTypes = new Set<string>();

  if ('variants' in moduleConfig) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Object.values(moduleConfig.variants).forEach((variant: any) => {
      getUsedTypes(variant.fields).forEach((type) => usedTypes.add(type));
    });
  } else {
    getUsedTypes(moduleConfig.fields).forEach((type) => usedTypes.add(type));
  }

  // Add imports only for types that are used
  if (usedTypes.size > 0) {
    content += `import type { ${Array.from(usedTypes)
      .sort()
      .join(', ')} } from '../../types';\n\n`;
  }

  if ('variants' in moduleConfig) {
    // First generate the base interface and generic subject if there's a generic variant
    if (moduleConfig.variants.generic) {
      const genericVariant = moduleConfig.variants.generic;
      const baseName = v.replaceAll(genericVariant.subject, 'Subject', '');
      content += generateInterface(baseName, genericVariant.fields);
      content += '\n\n';
      content += generateSubjectClass(
        baseName,
        genericVariant.format,
        true, // Mark as generic
      );
      content += '\n\n';
    }

    // Then generate all other variants
    Object.entries(moduleConfig.variants).forEach(
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ([key, variant]: [string, any]) => {
        if (key === 'generic') return; // Skip generic as it's already handled
        const baseName = v.replaceAll(variant.subject, 'Subject', '');
        content += generateInterface(baseName, variant.fields);
        content += '\n\n';
        content += generateSubjectClass(baseName, variant.format);
        content += '\n\n';
      },
    );
  } else {
    const baseName = v.replaceAll(moduleConfig.subject, 'Subject', '');
    content += generateInterface(baseName, moduleConfig.fields);
    content += '\n\n';
    content += generateSubjectClass(baseName, moduleConfig.format);
  }

  return content;
}

function generateMainIndex() {
  return `/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 */

${Object.keys(subjectsDefinitions)
  .map((moduleName) => `export * from './${v.lowerCase(moduleName)}';`)
  .join('\n')}
`;
}

async function generateAllSubjects() {
  try {
    console.log(`Generating subjects in: ${OUTPUT_DIR}`);

    // Generate subject-base.ts file
    const baseContent = generateSubjectBase();
    const basePath = path.join(OUTPUT_DIR, 'subject-base.ts');
    fs.writeFileSync(basePath, baseContent);
    console.log(`Generated: ${basePath}`);

    // Generate module files
    await Promise.all(
      Object.entries(subjectsDefinitions).map(async ([moduleName, config]) => {
        const moduleDir = path.join(OUTPUT_DIR, v.lowerCase(moduleName));
        fs.mkdirSync(moduleDir, { recursive: true });
        console.log(`Created module directory: ${moduleDir}`);

        // Generate subjects.ts
        const subjectsContent = await generateModuleSubjects(
          moduleName,
          config,
        );
        const subjectsPath = path.join(moduleDir, 'subjects.ts');
        fs.writeFileSync(subjectsPath, subjectsContent);
        console.log(`Generated: ${subjectsPath}`);

        // Generate stream.ts
        const streamContent = generateStream(moduleName);
        const streamPath = path.join(moduleDir, 'stream.ts');
        fs.writeFileSync(streamPath, streamContent);
        console.log(`Generated: ${streamPath}`);
      }),
    );

    // Generate main index.ts file
    const mainIndexContent = generateMainIndex();
    const mainIndexPath = path.join(OUTPUT_DIR, 'index.ts');
    fs.writeFileSync(mainIndexPath, mainIndexContent);
    console.log(`Generated: ${mainIndexPath}`);

    // Format all files
    console.log('\nFormatting generated files...');
    await $`biome format --write ${OUTPUT_DIR}`;

    console.log('\nSuccessfully generated and formatted all files!');
  } catch (error) {
    console.error('Error generating files:', error);
    process.exit(1);
  }
}

// Run the generator
generateAllSubjects();
