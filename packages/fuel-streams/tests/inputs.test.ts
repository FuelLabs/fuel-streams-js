import { describe, expect, it, vi } from 'vitest';
import {
  type Client,
  IdentifierKind,
  InputStream,
  InputsByIdSubject,
  InputsCoinSubject,
  InputsContractSubject,
  InputsMessageSubject,
  InputsSubject,
} from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

const VALID_BYTES32 =
  '0x1234567890123456789012345678901234567890123456789012345678901234';

describe('Input Module', () => {
  describe('InputStream', () => {
    it('should initialize a new input stream', async () => {
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

      const result = await InputStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Inputs);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('InputsSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new InputsSubject();
      expect(subject.parse()).toBe('inputs.*.*.>');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new InputsSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.${VALID_BYTES32}.*.>`);
    });

    it('should create a subject with specified index', () => {
      const subject = new InputsSubject().withIndex(2);
      expect(subject.parse()).toBe('inputs.*.2.>');
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new InputsSubject().withTxId(VALID_BYTES32).withIndex(2);
      expect(subject.parse()).toBe(`inputs.${VALID_BYTES32}.2.>`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new InputsSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTxId(null);
      expect(subject.parse()).toBe('inputs.*.2.>');
    });
  });

  describe('InputsByIdSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new InputsByIdSubject();
      expect(subject.parse()).toBe('by_id.inputs.*.*');
    });

    it('should create a subject with specified ID kind', () => {
      const subject = new InputsByIdSubject().withIdKind(
        IdentifierKind.AssetID,
      );
      expect(subject.parse()).toBe('by_id.inputs.asset_id.*');
    });

    it('should create a subject with specified ID value', () => {
      const subject = new InputsByIdSubject().withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.inputs.*.${VALID_BYTES32}`);
    });

    it('should create a subject with both ID kind and value', () => {
      const subject = new InputsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.inputs.asset_id.${VALID_BYTES32}`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new InputsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32)
        .withIdKind(null)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.inputs.*.${VALID_BYTES32}`);
    });
  });

  describe('InputsCoinSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new InputsCoinSubject();
      expect(subject.parse()).toBe('inputs.*.*.coin.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new InputsCoinSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.${VALID_BYTES32}.*.coin.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new InputsCoinSubject().withIndex(2);
      expect(subject.parse()).toBe('inputs.*.2.coin.*.*');
    });

    it('should create a subject with specified owner', () => {
      const subject = new InputsCoinSubject().withOwner(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.*.*.coin.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new InputsCoinSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.*.*.coin.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new InputsCoinSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withOwner(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `inputs.${VALID_BYTES32}.2.coin.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new InputsCoinSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withOwner(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `inputs.*.*.coin.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('InputsContractSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new InputsContractSubject();
      expect(subject.parse()).toBe('inputs.*.*.contract.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new InputsContractSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.${VALID_BYTES32}.*.contract.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new InputsContractSubject().withIndex(2);
      expect(subject.parse()).toBe('inputs.*.2.contract.*');
    });

    it('should create a subject with specified contract ID', () => {
      const subject = new InputsContractSubject().withContractId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.*.*.contract.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new InputsContractSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `inputs.${VALID_BYTES32}.2.contract.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new InputsContractSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`inputs.*.*.contract.${VALID_BYTES32}`);
    });
  });

  describe('InputsMessageSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new InputsMessageSubject();
      expect(subject.parse()).toBe('inputs.*.*.message.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new InputsMessageSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.${VALID_BYTES32}.*.message.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new InputsMessageSubject().withIndex(2);
      expect(subject.parse()).toBe('inputs.*.2.message.*.*');
    });

    it('should create a subject with specified sender', () => {
      const subject = new InputsMessageSubject().withSender(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.*.*.message.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified recipient', () => {
      const subject = new InputsMessageSubject().withRecipient(VALID_BYTES32);
      expect(subject.parse()).toBe(`inputs.*.*.message.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new InputsMessageSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withSender(VALID_BYTES32)
        .withRecipient(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `inputs.${VALID_BYTES32}.2.message.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new InputsMessageSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withSender(VALID_BYTES32)
        .withRecipient(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `inputs.*.*.message.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });
});
