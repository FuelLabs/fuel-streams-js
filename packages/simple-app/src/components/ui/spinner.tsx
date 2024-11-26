import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import * as React from 'react';

const spinnerVariants = 'animate-spin';

interface LoadingSpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string;
  size?: number;
}

const Spinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size = 16, ...props }, ref) => {
    return (
      <Loader
        ref={ref}
        className={cn(spinnerVariants, className)}
        size={size}
        {...props}
      />
    );
  },
);

Spinner.displayName = 'LoadingSpinner';

export { Spinner };
