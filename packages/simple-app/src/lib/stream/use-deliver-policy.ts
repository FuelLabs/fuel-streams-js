import { DeliverPolicy, DeliverPolicyType } from '@fuels/streams';
import { create } from 'zustand';

type DeliverPolicyState = {
  deliverPolicyType: DeliverPolicyType;
  blockNumber: number;
  deliverPolicy: DeliverPolicy;

  // Actions
  changeDeliverPolicyType: (type: DeliverPolicyType) => void;
  changeBlockNumber: (value: number) => void;
};

export const useDeliverPolicy = create<DeliverPolicyState>((set) => ({
  deliverPolicy: DeliverPolicy.new(),
  deliverPolicyType: DeliverPolicyType.New,
  blockNumber: 0,

  changeDeliverPolicyType: (type) => {
    const deliverPolicy =
      type === DeliverPolicyType.New
        ? DeliverPolicy.new()
        : DeliverPolicy.fromBlock(0);

    set({
      deliverPolicyType: type,
      deliverPolicy,
    });
  },

  changeBlockNumber: (value) => {
    const deliverPolicy = DeliverPolicy.fromBlock(value);
    set({
      blockNumber: value,
      deliverPolicy,
    });
  },
}));
