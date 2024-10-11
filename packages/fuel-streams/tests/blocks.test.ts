import type { Block } from 'fuels';
import { describe, expect, it, vi } from 'vitest';
import { BlockStream, BlocksSubject, type Client } from '../src';
import { StreamNames } from '../src/constants';
import { StreamFactory } from '../src/streams/stream';

describe('Block Module', () => {
  describe('BlockStream', () => {
    it('should initialize a new block stream', async () => {
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

      const result = await BlockStream.init(mockClient);

      expect(StreamFactory.get).toHaveBeenCalledWith(StreamNames.Blocks);
      expect(mockStream.init).toHaveBeenCalledWith(mockClient);
      expect(result).toBe('initialized stream');
    });
  });

  describe('BlocksSubject', () => {
    it('should create a subject with default wildcards', () => {
      const subject = new BlocksSubject();
      expect(subject.parse()).toBe('blocks.*.*');
    });

    it('should create a subject with specified producer', () => {
      const subject = new BlocksSubject().withProducer('0x1234');
      expect(subject.parse()).toBe('blocks.0x1234.*');
    });

    it('should create a subject with specified height', () => {
      const subject = new BlocksSubject().withHeight(100);
      expect(subject.parse()).toBe('blocks.*.100');
    });

    it('should create a subject with both producer and height', () => {
      const subject = new BlocksSubject()
        .withProducer('0x1234')
        .withHeight(100);
      expect(subject.parse()).toBe('blocks.0x1234.100');
    });

    it('should create a subject from a Fuel block', () => {
      const mockBlock = {
        header: {
          daHeight: {
            toNumber: () => 200,
          },
        },
      } as Block;

      const subject = BlocksSubject.fromFuelBlock(mockBlock);
      expect(subject.parse()).toBe('blocks.*.200');
    });

    it('should allow chaining of with methods', () => {
      const subject = new BlocksSubject()
        .withProducer('0x1234')
        .withHeight(100)
        .withProducer(null)
        .withHeight(200);
      expect(subject.parse()).toBe('blocks.*.200');
    });
  });
});
