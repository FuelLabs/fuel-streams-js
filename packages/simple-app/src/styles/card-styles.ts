import { cva } from 'class-variance-authority';

export const cardStyles = cva('shadow-none rounded-none', {
  variants: {
    type: {
      config: 'border-t-none border-b-none border-l-none border-r',
      stream: 'border-none',
    },
  },
  defaultVariants: {
    type: 'config',
  },
});
