import { DeliverPolicy } from '@fuels/streams';
import { subjectsDefinitions } from '@fuels/streams/subjects-def';
import { describe, expect, it } from 'vitest';
import { SubjectBuilder, fieldsToArray } from '../form/form-helpers';

describe('SubjectBuilder', () => {
  const builder = new SubjectBuilder(subjectsDefinitions);

  // Extract test case type for better readability
  type TestCase = {
    fields: Record<string, string>;
    expectedSubject: string;
    expectedPayload: {
      subject: string;
      params: Record<string, any>;
      deliverPolicy: DeliverPolicy;
    };
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
    expectedSubject,
    expectedPayload,
    deliverPolicy,
  }: {
    module: string;
    variant: string;
    fields: Record<string, string>;
    expectedSubject: string;
    expectedPayload: {
      subject: string;
      params: Record<string, any>;
      deliverPolicy: DeliverPolicy;
    };
    deliverPolicy: DeliverPolicy;
  }) {
    const mod = subjectsDefinitions[module as keyof typeof subjectsDefinitions];
    const variantData =
      mod.variants && variant
        ? mod.variants[variant as keyof typeof mod.variants]
        : mod;
    const currentFields = 'fields' in variantData ? variantData.fields : {};
    const result = builder.buildSubject({
      selectedModule: module,
      selectedVariant: variant,
      currentFields: fieldsToArray(currentFields),
      selectedFields: fields,
    });

    const payload = builder.buildPayload({
      selectedModule: module,
      selectedVariant: variant,
      selectedFields: fields,
      deliverPolicy,
    });

    return (
      result === expectedSubject &&
      JSON.stringify(payload) === JSON.stringify(expectedPayload)
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
        {
          fields: {},
          expectedSubject: subjectsDefinitions.blocks.wildcard,
          expectedPayload: {
            subject: 'blocks',
            params: {},
            deliverPolicy: DeliverPolicy.new(),
          },
        },
        {
          fields: { producer: '0x123', height: '100' },
          expectedSubject: 'blocks.0x123.100',
          expectedPayload: {
            subject: 'blocks',
            params: {
              producer: '0x123',
              height: '100',
            },
            deliverPolicy: DeliverPolicy.new(),
          },
        },
      ],
    },
    {
      name: 'transactions',
      cases: [
        {
          fields: {},
          expectedSubject: subjectsDefinitions.transactions.wildcard,
          expectedPayload: {
            subject: 'transactions',
            params: {},
            deliverPolicy: DeliverPolicy.new(),
          },
        },
        {
          fields: {
            block_height: '100',
            tx_id: '0x123',
            tx_index: '1',
            tx_status: 'success',
            kind: 'script',
          },
          expectedSubject: 'transactions.100.0x123.1.success.script',
          expectedPayload: {
            subject: 'transactions',
            params: {
              block_height: '100',
              tx_id: '0x123',
              tx_index: '1',
              tx_status: 'success',
              kind: 'script',
            },
            deliverPolicy: DeliverPolicy.new(),
          },
        },
      ],
    },
  ];

  // Test simple modules
  describe('simple modules (no variants)', () => {
    simpleModuleTests.forEach(({ name, cases }) => {
      describe(name, () => {
        cases.forEach(({ fields, expectedSubject, expectedPayload }) => {
          it(getTestDescription(fields), () => {
            expect(
              testModuleVariant({
                module: name,
                variant: '',
                fields,
                expectedSubject,
                expectedPayload,
                deliverPolicy: DeliverPolicy.new(),
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
    const variantModuleTests = Object.entries(subjectsDefinitions)
      .filter(([_, mod]) => 'variants' in mod)
      .map(([moduleName, mod]) => ({
        name: moduleName,
        variants: Object.entries(mod.variants || {}).map(
          ([variantName, variantDef]) => ({
            name: variantName,
            cases: [
              {
                fields: {},
                expectedSubject: variantDef.wildcard,
                expectedPayload: {
                  subject: `${moduleName}_${variantName}`,
                  params: {},
                  deliverPolicy: DeliverPolicy.new(),
                },
              },
              {
                fields: Object.keys(variantDef.fields).reduce(
                  (acc, field) => {
                    acc[field] = field.includes('id') ? '0x123' : '0';
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
                expectedSubject: variantDef.format.replace(
                  /\{(\w+)\}/g,
                  (_, field) => (field.includes('id') ? '0x123' : '0'),
                ),
                expectedPayload: {
                  subject: `${moduleName}_${variantName}`,
                  params: Object.keys(variantDef.fields).reduce(
                    (acc, field) => {
                      acc[field] = field.includes('id') ? '0x123' : '0';
                      return acc;
                    },
                    {} as Record<string, string>,
                  ),
                  deliverPolicy: DeliverPolicy.new(),
                },
              },
            ],
          }),
        ),
      }));

    variantModuleTests.forEach(({ name, variants }) => {
      describe(name, () => {
        variants.forEach(({ name: variantName, cases }) => {
          describe(variantName, () => {
            cases.forEach(({ fields, expectedSubject, expectedPayload }) => {
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
                    expectedSubject,
                    expectedPayload,
                    deliverPolicy: DeliverPolicy.new(),
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

      expect(
        builder.buildPayload({
          selectedModule: '',
          selectedVariant: '',
          selectedFields: {},
          deliverPolicy: DeliverPolicy.new(),
        }),
      ).toEqual({
        subject: '',
        params: {},
        deliverPolicy: DeliverPolicy.new(),
      });
    });

    it('replaces empty string field values with wildcards (*)', () => {
      expect(
        testModuleVariant({
          module: 'blocks',
          variant: '',
          fields: { producer: '', height: '100' },
          expectedSubject: 'blocks.*.100',
          expectedPayload: {
            subject: 'blocks',
            params: {
              height: '100',
            },
            deliverPolicy: DeliverPolicy.new(),
          },
          deliverPolicy: DeliverPolicy.new(),
        }),
      ).toBe(true);
    });
  });

  // Add new test for deliverPolicy
  it('respects custom deliverPolicy when provided', () => {
    expect(
      builder.buildPayload({
        selectedModule: 'blocks',
        selectedVariant: '',
        selectedFields: {},
        deliverPolicy: DeliverPolicy.fromBlock(100),
      }),
    ).toEqual({
      subject: 'blocks',
      params: {},
      deliverPolicy: DeliverPolicy.fromBlock(100),
    });
  });
});
