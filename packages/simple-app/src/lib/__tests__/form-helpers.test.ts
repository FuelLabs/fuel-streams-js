import { subjectsDefinitions } from '@fuels/streams/subjects-def';
import { describe, expect, it } from 'vitest';
import { SubjectBuilder, fieldsToArray } from '../form/form-helpers';

describe('SubjectBuilder', () => {
  const builder = new SubjectBuilder(subjectsDefinitions);

  // Extract test case type for better readability
  type TestCase = {
    fields: Record<string, string>;
    expected: string;
  };

  type ModuleTest = {
    name: string;
    cases: TestCase[];
  };

  // Helper function simplified and typed
  function testModuleVariant({
    module,
    variant,
    fields,
    expected,
  }: {
    module: string;
    variant: string;
    fields: Record<string, string>;
    expected: string;
  }) {
    const mod = subjectsDefinitions[module as keyof typeof subjectsDefinitions];
    const variantData =
      'variants' in mod
        ? mod.variants[variant as keyof typeof mod.variants]
        : mod;
    const currentFields = 'fields' in variantData ? variantData.fields : {};
    return (
      builder.buildSubject({
        selectedModule: module,
        selectedVariant: variant,
        currentFields: fieldsToArray(currentFields),
        selectedFields: fields,
      }) === expected
    );
  }

  // Helper to create test description
  function getTestDescription(fields: Record<string, string>): string {
    const isWildcard = Object.keys(fields).length === 0;
    return isWildcard
      ? 'returns wildcard when no fields are set'
      : `returns correct format for fields: ${Object.keys(fields).join(', ')}`;
  }

  // Simple modules test cases
  const simpleModuleTests: ModuleTest[] = [
    {
      name: 'blocks',
      cases: [
        { fields: {}, expected: subjectsDefinitions.blocks.wildcard },
        {
          fields: { producer: '0x123', height: '100' },
          expected: 'blocks.0x123.100',
        },
      ],
    },
    {
      name: 'logs',
      cases: [
        { fields: {}, expected: subjectsDefinitions.logs.wildcard },
        {
          fields: {
            block_height: '100',
            tx_id: '0x123',
            receipt_index: '1',
            log_id: '0x456',
          },
          expected: 'logs.100.0x123.1.0x456',
        },
      ],
    },
    {
      name: 'utxos',
      cases: [
        { fields: {}, expected: subjectsDefinitions.utxos.wildcard },
        {
          fields: {
            utxo_type: 'some_type',
            hash: '0x123',
          },
          expected: 'utxos.some_type.0x123',
        },
      ],
    },
  ];

  // Test simple modules
  describe('simple modules (no variants)', () => {
    simpleModuleTests.forEach(({ name, cases }) => {
      describe(name, () => {
        cases.forEach(({ fields, expected }) => {
          it(getTestDescription(fields), () => {
            expect(
              testModuleVariant({
                module: name,
                variant: '',
                fields,
                expected,
              }),
            ).toBe(true);
          });
        });
      });
    });
  });

  // Test modules with variants
  describe('modules with variants', () => {
    // Generate test cases for modules with variants
    // @ts-ignore - simplifying types for tests
    const variantModuleTests = Object.entries(subjectsDefinitions)
      .filter(([_, mod]) => 'variants' in mod)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .map(([moduleName, mod]: [string, any]) => ({
        name: moduleName,
        variants: Object.entries(mod.variants).map(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          ([variantName, variantDef]: [string, any]) => ({
            name: variantName,
            cases: [
              { fields: {}, expected: variantDef.wildcard },
              {
                fields: Object.keys(variantDef.fields).reduce(
                  (acc, field) => {
                    acc[field] = field.includes('id') ? '0x123' : '0';
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
                expected: variantDef.format.replace(
                  /\{(\w+)\}/g,
                  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                  (_: any, field: any) =>
                    field.includes('id') ? '0x123' : '0',
                ),
              },
            ],
          }),
        ),
      }));

    variantModuleTests.forEach(({ name, variants }) => {
      describe(name, () => {
        variants.forEach(({ name: variantName, cases }) => {
          describe(variantName, () => {
            cases.forEach(({ fields, expected }) => {
              const isWildcard = Object.keys(fields).length === 0;
              it(`${
                isWildcard
                  ? 'returns wildcard when no fields are set'
                  : `returns correct format for fields: ${Object.keys(
                      fields,
                    ).join(', ')}`
              }`, () => {
                expect(
                  testModuleVariant({
                    module: name,
                    variant: variantName,
                    fields,
                    expected,
                  }),
                ).toBe(true);
              });
            });
          });
        });
      });
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('returns empty string when no module is selected', () => {
      expect(
        builder.buildSubject({
          selectedModule: '',
          selectedVariant: '',
          currentFields: [],
          selectedFields: {},
        }),
      ).toBe('');
    });

    it('replaces empty string field values with wildcards (*)', () => {
      expect(
        testModuleVariant({
          module: 'blocks',
          variant: '',
          fields: { producer: '', height: '100' },
          expected: 'blocks.*.100',
        }),
      ).toBe(true);
    });
  });
});
