import { describe, expect, it, vi } from 'vitest';
import {
  type Client,
  IdentifierKind,
  OutputStream,
  OutputsByIdSubject,
  OutputsChangeSubject,
  OutputsCoinSubject,
  OutputsContractSubject,
  OutputsSubject,
  OutputsVariableSubject,
} from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

const VALID_BYTES32 =
  '0x1234567890123456789012345678901234567890123456789012345678901234';

describe('Output Module', () => {
  describe('OutputStream', () => {
    it('should initialize a new output stream', async () => {
      const mockClient = {} as Client;
      const mockStream = {
        init: vi.fn().mockResolvedValue('initialized stream'),
      };
      vi.spyOn(StreamFactory, 'get').mockReturnValue({
        ...mockStream,
        bucketName: 'mockBucketName',
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        stream: mockStream as any,
      });

      const result = await OutputStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Outputs);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('OutputsSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsSubject();
      expect(subject.parse()).toBe('outputs.*.*.>');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new OutputsSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.${VALID_BYTES32}.*.>`);
    });

    it('should create a subject with specified index', () => {
      const subject = new OutputsSubject().withIndex(2);
      expect(subject.parse()).toBe('outputs.*.2.>');
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new OutputsSubject().withTxId(VALID_BYTES32).withIndex(2);
      expect(subject.parse()).toBe(`outputs.${VALID_BYTES32}.2.>`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTxId(null);
      expect(subject.parse()).toBe('outputs.*.2.>');
    });
  });

  describe('OutputsByIdSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsByIdSubject();
      expect(subject.parse()).toBe('by_id.outputs.*.*');
    });

    it('should create a subject with specified ID kind', () => {
      const subject = new OutputsByIdSubject().withIdKind(
        IdentifierKind.AssetID,
      );
      expect(subject.parse()).toBe('by_id.outputs.asset_id.*');
    });

    it('should create a subject with specified ID value', () => {
      const subject = new OutputsByIdSubject().withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.outputs.*.${VALID_BYTES32}`);
    });

    it('should create a subject with both ID kind and value', () => {
      const subject = new OutputsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.outputs.asset_id.${VALID_BYTES32}`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32)
        .withIdKind(null)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.outputs.*.${VALID_BYTES32}`);
    });
  });

  describe('OutputsCoinSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsCoinSubject();
      expect(subject.parse()).toBe('outputs.coin.*.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new OutputsCoinSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.coin.${VALID_BYTES32}.*.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new OutputsCoinSubject().withIndex(2);
      expect(subject.parse()).toBe('outputs.coin.*.2.*.*');
    });

    it('should create a subject with specified to', () => {
      const subject = new OutputsCoinSubject().withTo(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.coin.*.*.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new OutputsCoinSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.coin.*.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new OutputsCoinSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `outputs.coin.${VALID_BYTES32}.2.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsCoinSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `outputs.coin.*.*.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('OutputsContractSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsContractSubject();
      expect(subject.parse()).toBe('outputs.contract.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new OutputsContractSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.contract.${VALID_BYTES32}.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new OutputsContractSubject().withIndex(2);
      expect(subject.parse()).toBe('outputs.contract.*.2.*');
    });

    it('should create a subject with specified contract ID', () => {
      const subject = new OutputsContractSubject().withContractId(
        VALID_BYTES32,
      );
      expect(subject.parse()).toBe(`outputs.contract.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new OutputsContractSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `outputs.contract.${VALID_BYTES32}.2.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsContractSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`outputs.contract.*.*.${VALID_BYTES32}`);
    });
  });

  describe('OutputsChangeSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsChangeSubject();
      expect(subject.parse()).toBe('outputs.change.*.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new OutputsChangeSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.change.${VALID_BYTES32}.*.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new OutputsChangeSubject().withIndex(2);
      expect(subject.parse()).toBe('outputs.change.*.2.*.*');
    });

    it('should create a subject with specified to', () => {
      const subject = new OutputsChangeSubject().withTo(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.change.*.*.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new OutputsChangeSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.change.*.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new OutputsChangeSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `outputs.change.${VALID_BYTES32}.2.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsChangeSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `outputs.change.*.*.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('OutputsVariableSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new OutputsVariableSubject();
      expect(subject.parse()).toBe('outputs.variable.*.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new OutputsVariableSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.variable.${VALID_BYTES32}.*.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new OutputsVariableSubject().withIndex(2);
      expect(subject.parse()).toBe('outputs.variable.*.2.*.*');
    });

    it('should create a subject with specified to', () => {
      const subject = new OutputsVariableSubject().withTo(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.variable.*.*.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new OutputsVariableSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(`outputs.variable.*.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new OutputsVariableSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `outputs.variable.${VALID_BYTES32}.2.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new OutputsVariableSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `outputs.variable.*.*.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });
});
