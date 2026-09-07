import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '../ui/card'

type MetricCardProps = {
  label: string
  value: string
  Icon: LucideIcon
}

export function MetricCard({ label, value, Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-34 flex-col justify-between gap-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--text)]">{label}</p>
          <span className="grid size-8 place-items-center rounded-md bg-mist-100 text-forest-800">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </div>
        <p className="text-xl font-semibold tracking-tight text-[var(--text-h)] sm:text-2xl">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
