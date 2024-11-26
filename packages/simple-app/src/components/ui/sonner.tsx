import { cva } from 'class-variance-authority';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const toastVariants = cva(
  'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
  {
    variants: {
      variant: {
        default: '',
        success: 'group-[.toaster]:border-green-500 [&_svg]:text-green-500',
        warning: 'group-[.toaster]:border-yellow-500 [&_svg]:text-yellow-500',
        error: 'group-[.toaster]:border-red-500 [&_svg]:text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: toastVariants(),
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: toastVariants({ variant: 'success' }),
          warning: toastVariants({ variant: 'warning' }),
          error: toastVariants({ variant: 'error' }),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
