import {
  type ModuleKeys,
  subjectsDefinitions,
} from '@fuels/streams/subjects-def';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { FormFieldsManager } from '../form/form-helpers';
import { formMachine } from '../form/use-dynamic-form';
import type { SubscriptionProps } from '../stream/use-subscriptions';
import type { Nullable } from '../utils';

const context = {
  input: {} as Nullable<SubscriptionProps>,
};

const fieldsManager = new FormFieldsManager(subjectsDefinitions);

describe('Dynamic Form Machine', () => {
  it('should start with initial state', () => {
    const actor = createActor(formMachine, context).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('idle');
    expect(snapshot.context).toEqual({
      selectedFields: undefined,
      subject: '',
      currentFields: undefined,
      subjectClass: undefined,
      subjectPayload: null,
      moduleOptions: fieldsManager.getModuleOptions(),
      variantOptions: undefined,
    });
    expect(snapshot.context.moduleOptions).toBeDefined();
    expect(snapshot.context.variantOptions).toEqual(undefined);
  });

  it('should update context when module changes', () => {
    const actor = createActor(formMachine, context).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.selectedModule).toBe('blocks');
    expect(snapshot.context.selectedVariant).toBe(null);
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.currentFields).toBeDefined();
    expect(snapshot.context.variantOptions).toBeDefined();
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'blocks',
      params: {},
    });
  });

  it('should update context when variant changes', () => {
    const actor = createActor(formMachine, context).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'inputs' as ModuleKeys });
    actor.send({ type: 'CHANGE.VARIANT', value: 'coin' });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.selectedVariant).toBe('coin');
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.currentFields).toBeDefined();
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'inputs_coin',
      params: {},
    });
  });

  it('should update fields and subject when field changes', () => {
    const actor = createActor(formMachine, context).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    const snapshot = actor.getSnapshot();

    expect(snapshot.context.formData).toEqual({ blockId: '123' });
    expect(snapshot.context.selectedFields).toEqual({ blockId: '123' });
    expect(snapshot.context.subject).toBeDefined();
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'blocks',
      params: { blockId: '123' },
    });
  });

  it('should maintain state between multiple field changes', () => {
    const actor = createActor(formMachine, context).start();

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
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'blocks',
      params: {
        blockId: '123',
        height: '456',
      },
    });
  });

  it('should reset form data when changing module', () => {
    const actor = createActor(formMachine, context).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'blocks' as ModuleKeys });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    actor.send({ type: 'CHANGE.MODULE', value: 'transactions' as ModuleKeys });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.selectedFields).toEqual({});
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'transactions',
      params: {},
    });
  });

  it('should reset form data when changing variant', () => {
    const actor = createActor(formMachine, context).start();

    actor.send({ type: 'CHANGE.MODULE', value: 'inputs' as ModuleKeys });
    actor.send({ type: 'CHANGE.VARIANT', value: 'coin' });
    actor.send({ type: 'CHANGE.FIELD', fieldName: 'blockId', value: '123' });
    actor.send({ type: 'CHANGE.VARIANT', value: 'message' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.formData).toEqual({});
    expect(snapshot.context.selectedFields).toEqual({});
    expect(snapshot.context.subjectPayload).toEqual({
      subject: 'inputs_message',
      params: {},
    });
  });
});
