import { describe, expect, it, vi } from 'vitest';
import {
  type Client,
  IdentifierKind,
  ReceiptStream,
  ReceiptsBurnSubject,
  ReceiptsByIdSubject,
  ReceiptsCallSubject,
  ReceiptsLogDataSubject,
  ReceiptsLogSubject,
  ReceiptsMessageOutSubject,
  ReceiptsMintSubject,
  ReceiptsPanicSubject,
  ReceiptsReturnDataSubject,
  ReceiptsReturnSubject,
  ReceiptsRevertSubject,
  ReceiptsScriptResultSubject,
  ReceiptsSubject,
  ReceiptsTransferSubject,
} from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

const VALID_BYTES32 =
  '0x1234567890123456789012345678901234567890123456789012345678901234';

describe('Receipt Module', () => {
  describe('ReceiptStream', () => {
    it('should initialize a new receipt stream', async () => {
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

      const result = await ReceiptStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Receipts);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('ReceiptsSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsSubject();
      expect(subject.parse()).toBe('receipts.*.*.>');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.>`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.>');
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.2.>`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTxId(null);
      expect(subject.parse()).toBe('receipts.*.2.>');
    });
  });

  describe('ReceiptsByIdSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsByIdSubject();
      expect(subject.parse()).toBe('by_id.receipts.*.*');
    });

    it('should create a subject with specified ID kind', () => {
      const subject = new ReceiptsByIdSubject().withIdKind(
        IdentifierKind.AssetID,
      );
      expect(subject.parse()).toBe('by_id.receipts.asset_id.*');
    });

    it('should create a subject with specified ID value', () => {
      const subject = new ReceiptsByIdSubject().withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.receipts.*.${VALID_BYTES32}`);
    });

    it('should create a subject with both ID kind and value', () => {
      const subject = new ReceiptsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.receipts.asset_id.${VALID_BYTES32}`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32)
        .withIdKind(null)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.receipts.*.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsCallSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsCallSubject();
      expect(subject.parse()).toBe('receipts.*.*.call.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsCallSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.call.*.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsCallSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.call.*.*.*');
    });

    it('should create a subject with specified from', () => {
      const subject = new ReceiptsCallSubject().withFrom(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.call.${VALID_BYTES32}.*.*`);
    });

    it('should create a subject with specified to', () => {
      const subject = new ReceiptsCallSubject().withTo(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.call.*.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new ReceiptsCallSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.call.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsCallSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withFrom(VALID_BYTES32)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.call.${VALID_BYTES32}.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsCallSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withFrom(VALID_BYTES32)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `receipts.*.*.call.${VALID_BYTES32}.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('ReceiptsReturnSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsReturnSubject();
      expect(subject.parse()).toBe('receipts.*.*.return.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsReturnSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.return.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsReturnSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.return.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsReturnSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.return.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsReturnSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.return.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsReturnSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.return.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsTransferSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsTransferSubject();
      expect(subject.parse()).toBe('receipts.*.*.transfer.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsTransferSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.*.transfer.*.*.*`,
      );
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsTransferSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.transfer.*.*.*');
    });

    it('should create a subject with specified from', () => {
      const subject = new ReceiptsTransferSubject().withFrom(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.*.*.transfer.${VALID_BYTES32}.*.*`,
      );
    });

    it('should create a subject with specified to', () => {
      const subject = new ReceiptsTransferSubject().withTo(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.*.*.transfer.*.${VALID_BYTES32}.*`,
      );
    });

    it('should create a subject with specified asset ID', () => {
      const subject = new ReceiptsTransferSubject().withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.*.*.transfer.*.*.${VALID_BYTES32}`,
      );
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsTransferSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withFrom(VALID_BYTES32)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.transfer.${VALID_BYTES32}.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsTransferSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withFrom(VALID_BYTES32)
        .withTo(VALID_BYTES32)
        .withAssetId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `receipts.*.*.transfer.${VALID_BYTES32}.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('ReceiptsReturnDataSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsReturnDataSubject();
      expect(subject.parse()).toBe('receipts.*.*.return_data.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsReturnDataSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.return_data.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsReturnDataSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.return_data.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsReturnDataSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.return_data.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsReturnDataSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.return_data.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsReturnDataSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.return_data.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsPanicSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsPanicSubject();
      expect(subject.parse()).toBe('receipts.*.*.panic.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsPanicSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.panic.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsPanicSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.panic.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsPanicSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.panic.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsPanicSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.panic.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsPanicSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.panic.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsRevertSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsRevertSubject();
      expect(subject.parse()).toBe('receipts.*.*.revert.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsRevertSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.revert.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsRevertSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.revert.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsRevertSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.revert.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsRevertSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.revert.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsRevertSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.revert.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsLogSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsLogSubject();
      expect(subject.parse()).toBe('receipts.*.*.log.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsLogSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.log.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsLogSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.log.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsLogSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.log.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsLogSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.log.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsLogSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.log.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsLogDataSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsLogDataSubject();
      expect(subject.parse()).toBe('receipts.*.*.log_data.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsLogDataSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.log_data.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsLogDataSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.log_data.*');
    });

    it('should create a subject with specified ID', () => {
      const subject = new ReceiptsLogDataSubject().withId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.log_data.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsLogDataSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.log_data.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsLogDataSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(`receipts.*.*.log_data.${VALID_BYTES32}`);
    });
  });

  describe('ReceiptsScriptResultSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsScriptResultSubject();
      expect(subject.parse()).toBe('receipts.*.*.script_result');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsScriptResultSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.script_result`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsScriptResultSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.script_result');
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsScriptResultSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.2.script_result`);
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsScriptResultSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withTxId(null);
      expect(subject.parse()).toBe('receipts.*.2.script_result');
    });
  });

  describe('ReceiptsMessageOutSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsMessageOutSubject();
      expect(subject.parse()).toBe('receipts.*.*.message_out.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsMessageOutSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.*.message_out.*.*`,
      );
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsMessageOutSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.message_out.*.*');
    });

    it('should create a subject with specified sender', () => {
      const subject = new ReceiptsMessageOutSubject().withSender(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.*.*.message_out.${VALID_BYTES32}.*`,
      );
    });

    it('should create a subject with specified recipient', () => {
      const subject = new ReceiptsMessageOutSubject().withRecipient(
        VALID_BYTES32,
      );
      expect(subject.parse()).toBe(
        `receipts.*.*.message_out.*.${VALID_BYTES32}`,
      );
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsMessageOutSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withSender(VALID_BYTES32)
        .withRecipient(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.message_out.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsMessageOutSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withSender(VALID_BYTES32)
        .withRecipient(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `receipts.*.*.message_out.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('ReceiptsMintSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsMintSubject();
      expect(subject.parse()).toBe('receipts.*.*.mint.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsMintSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.mint.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsMintSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.mint.*.*');
    });

    it('should create a subject with specified contract ID', () => {
      const subject = new ReceiptsMintSubject().withContractId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.mint.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified sub ID', () => {
      const subject = new ReceiptsMintSubject().withSubId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.mint.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsMintSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withSubId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.mint.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsMintSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withSubId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `receipts.*.*.mint.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });

  describe('ReceiptsBurnSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new ReceiptsBurnSubject();
      expect(subject.parse()).toBe('receipts.*.*.burn.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new ReceiptsBurnSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.${VALID_BYTES32}.*.burn.*.*`);
    });

    it('should create a subject with specified index', () => {
      const subject = new ReceiptsBurnSubject().withIndex(2);
      expect(subject.parse()).toBe('receipts.*.2.burn.*.*');
    });

    it('should create a subject with specified contract ID', () => {
      const subject = new ReceiptsBurnSubject().withContractId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.burn.${VALID_BYTES32}.*`);
    });

    it('should create a subject with specified sub ID', () => {
      const subject = new ReceiptsBurnSubject().withSubId(VALID_BYTES32);
      expect(subject.parse()).toBe(`receipts.*.*.burn.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new ReceiptsBurnSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withSubId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `receipts.${VALID_BYTES32}.2.burn.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new ReceiptsBurnSubject()
        .withTxId(VALID_BYTES32)
        .withIndex(2)
        .withContractId(VALID_BYTES32)
        .withSubId(VALID_BYTES32)
        .withTxId(null)
        .withIndex(null);
      expect(subject.parse()).toBe(
        `receipts.*.*.burn.${VALID_BYTES32}.${VALID_BYTES32}`,
      );
    });
  });
});
