import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent)] text-white shadow-sm hover:opacity-90',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text-h)] shadow-sm hover:bg-[var(--social-bg)]',
        secondary:
          'bg-[var(--code-bg)] text-[var(--text-h)] shadow-sm hover:opacity-80',
        ghost: 'text-[var(--text-h)] hover:bg-[var(--social-bg)]',
        link: 'h-auto px-0 py-0 text-[var(--accent)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  ),
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
