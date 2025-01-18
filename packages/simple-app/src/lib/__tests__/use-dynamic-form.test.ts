import type { ModuleKeys } from '@fuels/streams/subjects-def';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { formMachine } from '../form/use-dynamic-form';

describe('Dynamic Form Machine', () => {
  it('should start with initial state', () => {
    const actor = createActor(formMachine).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('idle');
    expect(snapshot.context).toMatchObject({
      selectedVariant: null,
      selectedFields: null,
      subject: null,
      formData: null,
      currentFields: [],
      subjectClass: null,
      subscriptionPayload: null,
    });
    expect(snapshot.context.moduleOptions).toBeDefined();
    expect(snapshot.context.variantOptions).toEqual([]);
  });

  it('should update context when module changes', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.selectedModule).toBe('blocks');
    expect(snapshot.context.selectedVariant).toBe(null);
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.currentFields).toBeDefined();
    expect(snapshot.context.variantOptions).toBeDefined();
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'blocks',
      params: {},
    });
  });

  it('should update context when variant changes', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'inputs' as ModuleKeys });
    actor.send({ type: 'CHANGE.VARIANT', value: 'coin' });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.selectedVariant).toBe('coin');
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.currentFields).toBeDefined();
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'inputs_coin',
      params: {},
    });
  });

  it('should update fields and subject when field changes', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.formData).toEqual({ blockId: '123' });
    expect(snapshot.context.selectedFields).toEqual({ blockId: '123' });
    expect(snapshot.context.subject).toBeDefined();
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'blocks',
      params: { blockId: '123' },
    });
  });

  it('should maintain state between multiple field changes', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'height', value: '456' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.formData).toEqual({
      blockId: '123',
      height: '456',
    });
    expect(snapshot.context.selectedFields).toEqual({
      blockId: '123',
      height: '456',
    });
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'blocks',
      params: {
        blockId: '123',
        height: '456',
      },
    });
  });

  it('should reset form data when changing module', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    actor.send({ type: 'CHANGE.MODULE', value: 'transactions' as ModuleKeys });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.selectedFields).toEqual({});
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'transactions',
      params: {},
    });
  });

  it('should reset form data when changing variant', () => {
    const actor = createActor(formMachine).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'inputs' as ModuleKeys });
    actor.send({ type: 'CHANGE.VARIANT', value: 'coin' });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    actor.send({ type: 'CHANGE.VARIANT', value: 'message' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.selectedFields).toEqual({});
    expect(snapshot.context.subscriptionPayload).toEqual({
      subject: 'inputs_message',
      params: {},
    });
  });
});
