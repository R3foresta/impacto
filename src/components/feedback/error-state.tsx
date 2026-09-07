import { CircleAlert } from 'lucide-react'

import type { FeedbackAction } from './loading-state'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export interface ErrorStateProps {
  title?: string
  detail?: string
  action?: FeedbackAction
}

export function ErrorState({
  title = 'No se pudo cargar la información',
  detail = 'Intenta nuevamente en unos momentos.',
  action,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent
        className="flex flex-col items-center gap-3 py-10 text-center"
        role="alert"
      >
        <CircleAlert aria-hidden="true" className="size-6 text-red-600" />
        <div className="space-y-1">
          <h2 className="font-semibold text-[var(--text-h)]">{title}</h2>
          {detail ? <p className="text-sm text-[var(--text)]">{detail}</p> : null}
        </div>
        {action ? (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
