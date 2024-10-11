import { describe, expect, it, vi } from 'vitest';
import {
  type Client,
  IdentifierKind,
  TransactionKind,
  TransactionStatus,
  TransactionStream,
  TransactionsByIdSubject,
  TransactionsSubject,
} from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

const VALID_BYTES32 =
  '0x1234567890123456789012345678901234567890123456789012345678901234';

describe('Transaction Module', () => {
  describe('TransactionStream', () => {
    it('should initialize a new transaction stream', async () => {
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

      const result = await TransactionStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Transactions);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('TransactionsSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new TransactionsSubject();
      expect(subject.parse()).toBe('transactions.*.*.*.*.*');
    });

    it('should create a subject with specified block height', () => {
      const subject = new TransactionsSubject().withBlockHeight(100);
      expect(subject.parse()).toBe('transactions.100.*.*.*.*');
    });

    it('should create a subject with specified transaction index', () => {
      const subject = new TransactionsSubject().withTxIndex(2);
      expect(subject.parse()).toBe('transactions.*.2.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new TransactionsSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`transactions.*.*.${VALID_BYTES32}.*.*`);
    });

    it('should create a subject with specified status', () => {
      const subject = new TransactionsSubject().withStatus(
        TransactionStatus.Success,
      );
      expect(subject.parse()).toBe('transactions.*.*.*.success.*');
    });

    it('should create a subject with specified kind', () => {
      const subject = new TransactionsSubject().withKind(
        TransactionKind.Script,
      );
      expect(subject.parse()).toBe('transactions.*.*.*.*.script');
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new TransactionsSubject()
        .withBlockHeight(100)
        .withTxIndex(2)
        .withTxId(VALID_BYTES32)
        .withStatus(TransactionStatus.Success)
        .withKind(TransactionKind.Script);
      expect(subject.parse()).toBe(
        `transactions.100.2.${VALID_BYTES32}.success.script`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new TransactionsSubject()
        .withBlockHeight(100)
        .withTxIndex(2)
        .withTxId(VALID_BYTES32)
        .withStatus(TransactionStatus.Success)
        .withKind(TransactionKind.Script)
        .withBlockHeight(null)
        .withTxIndex(null);
      expect(subject.parse()).toBe(
        `transactions.*.*.${VALID_BYTES32}.success.script`,
      );
    });
  });

  describe('TransactionsByIdSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new TransactionsByIdSubject();
      expect(subject.parse()).toBe('by_id.transactions.*.*');
    });

    it('should create a subject with specified ID kind', () => {
      const subject = new TransactionsByIdSubject().withIdKind(
        IdentifierKind.AssetID,
      );
      expect(subject.parse()).toBe('by_id.transactions.asset_id.*');
    });

    it('should create a subject with specified ID value', () => {
      const subject = new TransactionsByIdSubject().withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.transactions.*.${VALID_BYTES32}`);
    });

    it('should create a subject with both ID kind and value', () => {
      const subject = new TransactionsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `by_id.transactions.asset_id.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new TransactionsByIdSubject()
        .withIdKind(IdentifierKind.AssetID)
        .withIdValue(VALID_BYTES32)
        .withIdKind(null)
        .withIdValue(VALID_BYTES32);
      expect(subject.parse()).toBe(`by_id.transactions.*.${VALID_BYTES32}`);
    });
  });
});
