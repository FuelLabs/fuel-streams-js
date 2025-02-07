import { DeliverPolicy, DeliverPolicyType } from '@fuels/streams';
import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';

export const deliverPolicyMachine = setup({
  types: {
    context: {} as {
      deliverPolicyType: DeliverPolicyType;
      blockNumber: number;
      deliverPolicy: DeliverPolicy;
    },
    events: {} as
      | {
          type: 'CHANGE.DELIVER_POLICY_TYPE';
          deliverPolicyType: DeliverPolicyType;
          deliverPolicy: DeliverPolicy;
        }
      | {
          type: 'CHANGE.BLOCK_NUMBER';
          blockNumber: number;
          deliverPolicy: DeliverPolicy;
        },
  },
}).createMachine({
  id: 'deliverPolicy',
  initial: 'idle',
  context: {
    deliverPolicy: DeliverPolicy.new(),
    deliverPolicyType: DeliverPolicyType.New,
    blockNumber: 0,
  },
  states: {
    idle: {
      on: {
        'CHANGE.DELIVER_POLICY_TYPE': {
          actions: [
            assign({
              deliverPolicyType: ({ event }) => event.deliverPolicyType,
              deliverPolicy: ({ event }) => event.deliverPolicy,
            }),
          ],
        },
        'CHANGE.BLOCK_NUMBER': {
          actions: [
            assign({
              blockNumber: ({ event }) => event.blockNumber,
              deliverPolicy: ({ event }) => event.deliverPolicy,
            }),
          ],
        },
      },
    },
  },
});

type State = StateFrom<typeof deliverPolicyMachine>;

const selectors = {
  deliverPolicyType: (state: State) => state.context.deliverPolicyType,
  blockNumber: (state: State) => state.context.blockNumber,
  deliverPolicy: (state: State) => state.context.deliverPolicy,
};

export const DeliverPolicyContext = createActorContext(deliverPolicyMachine);

export function useDeliverPolicy() {
  const actor = DeliverPolicyContext.useActorRef();
  const deliverPolicyType = DeliverPolicyContext.useSelector(
    selectors.deliverPolicyType,
  );
  const blockNumber = DeliverPolicyContext.useSelector(selectors.blockNumber);
  const deliverPolicy = DeliverPolicyContext.useSelector(
    selectors.deliverPolicy,
  );

  const handleDeliverPolicyTypeChange = (type: DeliverPolicyType) => {
    const deliverPolicy =
      type === DeliverPolicyType.New
        ? DeliverPolicy.new()
        : DeliverPolicy.fromBlock(0);
    actor.send({
      type: 'CHANGE.DELIVER_POLICY_TYPE',
      deliverPolicyType: type,
      deliverPolicy,
    });
  };

  const handleBlockNumberChange = (value: number) => {
    const deliverPolicy = DeliverPolicy.fromBlock(value);
    actor.send({
      type: 'CHANGE.BLOCK_NUMBER',
      blockNumber: value,
      deliverPolicy,
    });
  };

  return {
    deliverPolicyType,
    blockNumber,
    deliverPolicy,
    handleDeliverPolicyTypeChange,
    handleBlockNumberChange,
  };
}
