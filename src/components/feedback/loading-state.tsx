import { LoaderCircle } from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export type FeedbackAction = {
  label: string
  onClick: () => void
}

export interface LoadingStateProps {
  title?: string
  detail?: string
  action?: FeedbackAction
}

export function LoadingState({
  title = 'Cargando',
  detail = 'Estamos preparando la información.',
  action,
}: LoadingStateProps) {
  return (
    <Card>
      <CardContent
        aria-busy="true"
        aria-live="polite"
        className="flex flex-col items-center gap-3 py-10 text-center"
        role="status"
      >
        <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-[var(--accent)]" />
        <div className="space-y-1">
          <h2 className="font-semibold text-[var(--text-h)]">{title}</h2>
          {detail ? <p className="text-sm text-[var(--text)]">{detail}</p> : null}
        </div>
        {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
      </CardContent>
    </Card>
  )
}
