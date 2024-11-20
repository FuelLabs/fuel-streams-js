import { cva } from 'class-variance-authority';

export const cardStyles = cva('shadow-none rounded-none', {
  variants: {
    type: {
      config: 'col-span-2 border-t-none border-b-none border-l-none border-r',
      stream: 'col-span-3 border-none',
    },
  },
  defaultVariants: {
    type: 'config',
  },
});
