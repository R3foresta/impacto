import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/utils'

type CardProps = ComponentPropsWithoutRef<'div'>

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] shadow-sm',
        className,
      )}
      {...props}
    />
  ),
)

Card.displayName = 'Card'

type CardHeaderProps = ComponentPropsWithoutRef<'div'>

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn('grid gap-1.5 px-6 pt-6', className)}
      {...props}
    />
  ),
)

CardHeader.displayName = 'CardHeader'

type CardTitleProps = ComponentPropsWithoutRef<'h3'>

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
)

CardTitle.displayName = 'CardTitle'

type CardDescriptionProps = ComponentPropsWithoutRef<'p'>

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn('text-sm text-[var(--text)]', className)}
      {...props}
    />
  ),
)

CardDescription.displayName = 'CardDescription'

type CardActionProps = ComponentPropsWithoutRef<'div'>

const CardAction = forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  ),
)

CardAction.displayName = 'CardAction'

type CardContentProps = ComponentPropsWithoutRef<'div'>

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  ),
)

CardContent.displayName = 'CardContent'

type CardFooterProps = ComponentPropsWithoutRef<'div'>

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn('flex items-center px-6 pb-6 pt-6', className)}
      {...props}
    />
  ),
)

CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
export type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
}
