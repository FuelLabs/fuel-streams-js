/**
 * This file is auto-generated by scripts/generate-subjects.ts
 * Do not edit this file manually
 *
 * Generated Subjects:
 * - MessagesSubject
 */

import { MessageParser } from '../../parsers';
import type {
  Address,
  BlockHeight,
  Message,
  MessageType,
  Nonce,
  RawMessage,
} from '../../types';
import { SubjectBase } from '../subject-base';

type MessagesFields = {
  messageType: MessageType;
  blockHeight: BlockHeight;
  messageIndex: number;
  sender: Address;
  recipient: Address;
  nonce: Nonce;
};

export class MessagesSubject extends SubjectBase<
  MessagesFields,
  Message,
  RawMessage
> {
  metadata = {
    id: 'messages',
    format:
      'messages.{message_type}.{block_height}.{message_index}.{sender}.{recipient}.{nonce}',
    parser: new MessageParser(),
  };
}
