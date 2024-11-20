import { describe, expect, it } from 'vitest';
import { formStructure } from '../form-fields';
import {
  FormFieldsManager,
  SubjectBuilder,
  fieldsToArray,
} from '../form-helpers';
import type { FormModuleType } from '../form-types';

const builder = new SubjectBuilder();

describe('FormFieldsManager', () => {
  const manager = new FormFieldsManager(formStructure);

  describe('getModuleFields', () => {
    it('returns empty array for no module selected', () => {
      expect(manager.getModuleFields('')).toEqual([]);
    });

    it('returns fields for simple module', () => {
      expect(manager.getModuleFields('blocks')).toEqual(
        fieldsToArray(formStructure.blocks.fields),
      );
    });

    it('returns empty array for module with variants but no variant selected', () => {
      expect(manager.getModuleFields('inputs')).toEqual([]);
    });

    it('returns byId fields when byId variant is selected', () => {
      expect(manager.getModuleFields('inputs', 'byId')).toEqual(
        fieldsToArray(formStructure.inputs.byId!.fields),
      );
    });

    it('returns variant fields when variant is selected', () => {
      expect(manager.getModuleFields('inputs', 'coin')).toEqual(
        fieldsToArray(formStructure.inputs.variants.coin.fields),
      );
    });
  });

  describe('getModuleOptions', () => {
    it('returns all modules as options', () => {
      const options = manager.getModuleOptions();
      expect(options).toEqual([
        { value: 'blocks', label: 'Blocks' },
        { value: 'inputs', label: 'Inputs' },
        { value: 'outputs', label: 'Outputs' },
        { value: 'receipts', label: 'Receipts' },
        { value: 'transactions', label: 'Transactions' },
        { value: 'logs', label: 'Logs' },
        { value: 'utxos', label: 'UTXOs' },
      ]);
    });
  });

  describe('getVariantOptions', () => {
    it('returns empty array for module without variants', () => {
      expect(manager.getVariantOptions('blocks')).toEqual([]);
    });

    it('returns all variants including byId for module with variants', () => {
      const options = manager.getVariantOptions('inputs');
      expect(options).toEqual([
        { value: 'byId', label: 'By ID' },
        { value: 'coin', label: 'Coin Input' },
        { value: 'contract', label: 'Contract Input' },
        { value: 'message', label: 'Message Input' },
      ]);
    });
  });
});

describe('SubjectBuilder', () => {
  // Simple modules (no variants)
  describe('blocks module', () => {
    it('builds wildcard subject with no fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'blocks',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.blocks.fields),
          selectedFields: {},
        }),
      ).toBe('blocks.>');
    });

    it('builds complete subject with all fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'blocks',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.blocks.fields),
          selectedFields: {
            producer: '0x123',
            height: '100',
          },
        }),
      ).toBe('blocks.0x123.100');
    });

    it('builds subject with partial fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'blocks',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.blocks.fields),
          selectedFields: {
            producer: '0x123',
          },
        }),
      ).toBe('blocks.0x123.*');
    });
  });

  describe('logs module', () => {
    it('builds wildcard subject with no fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'logs',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.logs.fields),
          selectedFields: {},
        }),
      ).toBe('logs.>');
    });

    it('builds complete subject with all fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'logs',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.logs.fields),
          selectedFields: {
            block_height: '100',
            tx_id: '0x123',
            receipt_index: '1',
            log_id: '0x456',
          },
        }),
      ).toBe('logs.100.0x123.1.0x456');
    });

    it('builds subject with partial fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'logs',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.logs.fields),
          selectedFields: {
            block_height: '100',
            tx_id: '0x123',
          },
        }),
      ).toBe('logs.100.0x123.*.*');
    });
  });

  // Modules with variants
  describe('inputs module', () => {
    describe('byId variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.inputs.byId!.fields),
            selectedFields: {},
          }),
        ).toBe('by_id.inputs.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.inputs.byId!.fields),
            selectedFields: {
              id_kind: 'AssetId',
              id_value: '0x123',
            },
          }),
        ).toBe('by_id.inputs.asset_id.0x123');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.inputs.byId!.fields),
            selectedFields: {
              id_kind: 'AssetId',
            },
          }),
        ).toBe('by_id.inputs.asset_id.*');
      });
    });

    describe('coin variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.coin.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('inputs.coin.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.coin.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              owner: '0x456',
              asset_id: '0x789',
            },
          }),
        ).toBe('inputs.coin.0x123.0.0x456.0x789');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.coin.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              owner: '0x456',
            },
          }),
        ).toBe('inputs.coin.0x123.*.0x456.*');
      });
    });

    describe('contract variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'contract',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.contract.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('inputs.contract.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'contract',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.contract.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              contract_id: '0x456',
            },
          }),
        ).toBe('inputs.contract.0x123.0.0x456');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'contract',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.contract.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              contract_id: '0x456',
            },
          }),
        ).toBe('inputs.contract.0x123.*.0x456');
      });
    });

    describe('message variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'message',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.message.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('inputs.message.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'message',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.message.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              sender: '0x456',
              recipient: '0x789',
            },
          }),
        ).toBe('inputs.message.0x123.0.0x456.0x789');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'inputs',
            selectedVariant: 'message',
            currentFields: fieldsToArray(
              formStructure.inputs.variants.message.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              sender: '0x456',
            },
          }),
        ).toBe('inputs.message.0x123.*.0x456.*');
      });
    });
  });

  describe('outputs module', () => {
    describe('byId variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.outputs.byId!.fields),
            selectedFields: {},
          }),
        ).toBe('by_id.outputs.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.outputs.byId!.fields),
            selectedFields: {
              id_kind: 'ContractId',
              id_value: '0x123',
            },
          }),
        ).toBe('by_id.outputs.contract_id.0x123');
      });
    });

    describe('coin variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.coin.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('outputs.coin.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.coin.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              to: '0x456',
              asset_id: '0x789',
            },
          }),
        ).toBe('outputs.coin.0x123.0.0x456.0x789');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'coin',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.coin.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              to: '0x456',
            },
          }),
        ).toBe('outputs.coin.0x123.*.0x456.*');
      });
    });

    describe('contract variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'contract',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.contract.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('outputs.contract.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'contract',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.contract.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              contract_id: '0x456',
            },
          }),
        ).toBe('outputs.contract.0x123.*.0x456');
      });
    });

    describe('change variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'change',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.change.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('outputs.change.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'change',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.change.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              to: '0x456',
            },
          }),
        ).toBe('outputs.change.0x123.*.0x456.*');
      });
    });

    describe('variable variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'variable',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.variable.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('outputs.variable.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'variable',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.variable.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              to: '0x456',
            },
          }),
        ).toBe('outputs.variable.0x123.*.0x456.*');
      });
    });

    describe('contractCreated variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'contractCreated',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.contractCreated.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('outputs.contract_created.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'outputs',
            selectedVariant: 'contractCreated',
            currentFields: fieldsToArray(
              formStructure.outputs.variants.contractCreated.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              contract_id: '0x456',
            },
          }),
        ).toBe('outputs.contract_created.0x123.*.0x456');
      });
    });
  });

  describe('receipts module', () => {
    describe('byId variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.receipts.byId!.fields),
            selectedFields: {},
          }),
        ).toBe('by_id.receipts.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(formStructure.receipts.byId!.fields),
            selectedFields: {
              id_kind: 'ContractId',
            },
          }),
        ).toBe('by_id.receipts.contract_id.*');
      });
    });

    describe('return variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'return',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.return.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.return.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'return',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.return.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.return.0x123.*.0x456');
      });
    });

    describe('returnData variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'returnData',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.returnData.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.return_data.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'returnData',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.returnData.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.return_data.0x123.*.0x456');
      });
    });

    describe('scriptResult variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'scriptResult',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.scriptResult.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.script_result.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'scriptResult',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.scriptResult.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
            },
          }),
        ).toBe('receipts.script_result.0x123.*');
      });
    });

    describe('messageOut variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'messageOut',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.messageOut.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.message_out.>');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'messageOut',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.messageOut.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              sender: '0x456',
            },
          }),
        ).toBe('receipts.message_out.0x123.*.0x456.*');
      });
    });

    describe('call variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'call',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.call.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.call.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'call',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.call.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              from: '0x456',
              to: '0x789',
              asset_id: '0x101',
            },
          }),
        ).toBe('receipts.call.0x123.0.0x456.0x789.0x101');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'call',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.call.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              from: '0x456',
            },
          }),
        ).toBe('receipts.call.0x123.*.0x456.*.*');
      });
    });

    describe('panic variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'panic',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.panic.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.panic.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'panic',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.panic.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              id: '0x456',
            },
          }),
        ).toBe('receipts.panic.0x123.0.0x456');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'panic',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.panic.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.panic.0x123.*.0x456');
      });
    });

    describe('revert variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'revert',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.revert.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.revert.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'revert',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.revert.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              id: '0x456',
            },
          }),
        ).toBe('receipts.revert.0x123.0.0x456');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'revert',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.revert.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.revert.0x123.*.0x456');
      });
    });

    describe('log variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'log',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.log.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.log.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'log',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.log.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              id: '0x456',
            },
          }),
        ).toBe('receipts.log.0x123.0.0x456');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'log',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.log.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.log.0x123.*.0x456');
      });
    });

    describe('logData variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'logData',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.logData.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.log_data.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'logData',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.logData.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              id: '0x456',
            },
          }),
        ).toBe('receipts.log_data.0x123.0.0x456');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'logData',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.logData.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              id: '0x456',
            },
          }),
        ).toBe('receipts.log_data.0x123.*.0x456');
      });
    });

    describe('transfer variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transfer',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transfer.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.transfer.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transfer',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transfer.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              from: '0x456',
              to: '0x789',
              asset_id: '0x101',
            },
          }),
        ).toBe('receipts.transfer.0x123.0.0x456.0x789.0x101');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transfer',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transfer.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              from: '0x456',
              to: '0x789',
            },
          }),
        ).toBe('receipts.transfer.0x123.*.0x456.0x789.*');
      });
    });

    describe('transferOut variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transferOut',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transferOut.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.transfer_out.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transferOut',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transferOut.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              from: '0x456',
              to: '0x789',
              asset_id: '0x101',
            },
          }),
        ).toBe('receipts.transfer_out.0x123.0.0x456.0x789.0x101');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'transferOut',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.transferOut.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              from: '0x456',
              to: '0x789',
            },
          }),
        ).toBe('receipts.transfer_out.0x123.*.0x456.0x789.*');
      });
    });

    describe('mint variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'mint',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.mint.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.mint.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'mint',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.mint.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              contract_id: '0x456',
              sub_id: '0x789',
            },
          }),
        ).toBe('receipts.mint.0x123.0.0x456.0x789');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'mint',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.mint.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              contract_id: '0x456',
            },
          }),
        ).toBe('receipts.mint.0x123.*.0x456.*');
      });
    });

    describe('burn variant', () => {
      it('builds wildcard subject with no fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'burn',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.burn.fields,
            ),
            selectedFields: {},
          }),
        ).toBe('receipts.burn.>');
      });

      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'burn',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.burn.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              index: '0',
              contract_id: '0x456',
              sub_id: '0x789',
            },
          }),
        ).toBe('receipts.burn.0x123.0.0x456.0x789');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'receipts',
            selectedVariant: 'burn',
            currentFields: fieldsToArray(
              formStructure.receipts.variants.burn.fields,
            ),
            selectedFields: {
              tx_id: '0x123',
              contract_id: '0x456',
            },
          }),
        ).toBe('receipts.burn.0x123.*.0x456.*');
      });
    });
  });

  describe('transactions module', () => {
    describe('byId variant', () => {
      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'transactions',
            selectedVariant: 'byId',
            currentFields: fieldsToArray(
              formStructure.transactions.byId!.fields,
            ),
            selectedFields: {
              id_kind: 'ContractId',
              id_value: '0x123',
            },
          }),
        ).toBe('by_id.transactions.contract_id.0x123');
      });
    });

    describe('transaction variant', () => {
      it('builds complete subject with all fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'transactions',
            selectedVariant: 'transaction',
            currentFields: fieldsToArray(
              formStructure.transactions.variants.transaction.fields,
            ),
            selectedFields: {
              block_height: '100',
              index: '0',
              tx_id: '0x123',
              status: 'success',
              kind: 'create',
            },
          }),
        ).toBe('transactions.transaction.100.0.0x123.success.create');
      });

      it('builds subject with partial fields', () => {
        expect(
          builder.buildSubject({
            selectedModule: 'transactions',
            selectedVariant: 'transaction',
            currentFields: fieldsToArray(
              formStructure.transactions.variants.transaction.fields,
            ),
            selectedFields: {
              block_height: '100',
              tx_id: '0x123',
            },
          }),
        ).toBe('transactions.transaction.100.*.0x123.*.*');
      });
    });
  });

  describe('utxos module', () => {
    it('builds wildcard subject with no fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'utxos',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.utxos.fields),
          selectedFields: {},
        }),
      ).toBe('utxos.>');
    });

    it('builds complete subject with all fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'utxos',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.utxos.fields),
          selectedFields: {
            hash: '0x123',
            utxo_type: 'message',
          },
        }),
      ).toBe('utxos.0x123.message');
    });

    it('builds subject with partial fields', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'utxos',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.utxos.fields),
          selectedFields: {
            hash: '0x123',
          },
        }),
      ).toBe('utxos.0x123.*');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for no module selected', () => {
      expect(
        builder.buildSubject({
          selectedModule: '' as unknown as FormModuleType,
          selectedVariant: '',
          currentFields: [],
          selectedFields: {},
        }),
      ).toBe('');
    });

    it('handles empty string field values as wildcards', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'blocks',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.blocks.fields),
          selectedFields: {
            producer: '',
            height: '100',
          },
        }),
      ).toBe('blocks.*.100');
    });

    it('handles undefined field values as wildcards', () => {
      expect(
        builder.buildSubject({
          selectedModule: 'blocks',
          selectedVariant: '',
          currentFields: fieldsToArray(formStructure.blocks.fields),
          selectedFields: {
            height: '100',
          },
        }),
      ).toBe('blocks.*.100');
    });
  });
});
