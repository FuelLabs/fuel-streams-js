import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import {
  type ButtonHTMLAttributes,
  Children,
  type HTMLAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { Button } from './button';

export interface ButtonGroupItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  value?: string;
}

const buttonGroupStyles = cva('shadow-none rounded-sm', {
  variants: {
    active: {
      true: '',
      false: 'hover:bg-transparent',
    },
  },
});

const ButtonGroupItem = forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <Button
        variant={active ? 'default' : 'ghost'}
        className={buttonGroupStyles({ className, active })}
        ref={ref}
        {...props}
      />
    );
  },
);
ButtonGroupItem.displayName = 'ButtonGroupItem';

interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, defaultValue, onValueChange, ...props }, ref) => {
    const [activeOption, setActiveOption] = useState(defaultValue);

    function handleOptionClick(option: string) {
      setActiveOption(option);
      onValueChange?.(option);
    }

    useEffect(() => {
      if (defaultValue !== undefined) {
        setActiveOption(defaultValue);
      }
    }, [defaultValue]);

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex rounded-md border bg-muted p-[5px] gap-1',
          className,
        )}
        {...props}
      >
        {Children.map(children, (child) => {
          if (!isValidElement<ButtonGroupItemProps>(child)) return null;
          const value = child.props.value;
          if (!value) {
            throw new Error(
              'ButtonGroupItem need to has a data-value property',
            );
          }

          return cloneElement(child, {
            ...child.props,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              child.props.onClick?.(e);
              handleOptionClick(value);
            },
            active: activeOption === value,
          });
        })}
      </div>
    );
  },
);
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup, ButtonGroupItem };
