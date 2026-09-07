import { Inbox } from 'lucide-react'

import type { FeedbackAction } from './loading-state'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export interface EmptyStateProps {
  title?: string
  detail?: string
  action?: FeedbackAction
}

export function EmptyState({
  title = 'No hay información disponible',
  detail = 'Aún no hay nada para mostrar.',
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent
        aria-live="polite"
        className="flex flex-col items-center gap-3 py-10 text-center"
        role="status"
      >
        <Inbox aria-hidden="true" className="size-6 text-[var(--text)]" />
        <div className="space-y-1">
          <h2 className="font-semibold text-[var(--text-h)]">{title}</h2>
          {detail ? <p className="text-sm text-[var(--text)]">{detail}</p> : null}
        </div>
        {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
      </CardContent>
    </Card>
  )
}
