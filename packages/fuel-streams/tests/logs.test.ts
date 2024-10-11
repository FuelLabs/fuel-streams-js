import { describe, expect, it, vi } from 'vitest';
import { type Client, LogStream, LogsSubject } from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

const VALID_BYTES32 =
  '0x1234567890123456789012345678901234567890123456789012345678901234';

describe('Log Module', () => {
  describe('LogStream', () => {
    it('should initialize a new log stream', async () => {
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

      const result = await LogStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Logs);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('LogsSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new LogsSubject();
      expect(subject.parse()).toBe('logs.*.*.*.*');
    });

    it('should create a subject with specified block height', () => {
      const subject = new LogsSubject().withBlockHeight(100);
      expect(subject.parse()).toBe('logs.100.*.*.*');
    });

    it('should create a subject with specified transaction ID', () => {
      const subject = new LogsSubject().withTxId(VALID_BYTES32);
      expect(subject.parse()).toBe(`logs.*.${VALID_BYTES32}.*.*`);
    });

    it('should create a subject with specified receipt index', () => {
      const subject = new LogsSubject().withReceiptIndex(2);
      expect(subject.parse()).toBe('logs.*.*.2.*');
    });

    it('should create a subject with specified log ID', () => {
      const subject = new LogsSubject().withLogId(VALID_BYTES32);
      expect(subject.parse()).toBe(`logs.*.*.*.${VALID_BYTES32}`);
    });

    it('should create a subject with multiple specified fields', () => {
      const subject = new LogsSubject()
        .withBlockHeight(100)
        .withTxId(VALID_BYTES32)
        .withReceiptIndex(2)
        .withLogId(VALID_BYTES32);
      expect(subject.parse()).toBe(
        `logs.100.${VALID_BYTES32}.2.${VALID_BYTES32}`,
      );
    });

    it('should allow chaining of with methods', () => {
      const subject = new LogsSubject()
        .withBlockHeight(100)
        .withTxId(VALID_BYTES32)
        .withReceiptIndex(2)
        .withLogId(VALID_BYTES32)
        .withBlockHeight(null)
        .withTxId(null);
      expect(subject.parse()).toBe(`logs.*.*.2.${VALID_BYTES32}`);
    });
  });
});
