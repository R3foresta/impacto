import { CalendarDays, Leaf, MapPin, UsersRound } from 'lucide-react'

import { formatCount, formatDate, formatStatus } from '../../lib/formatters'
import type { ImpactProject } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { VerificationStatus } from './verification-status'

type ProjectListProps = {
  projects: ImpactProject[]
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <section aria-labelledby="projects-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Restauración en curso</p>
        <h2
          className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]"
          id="projects-title"
        >
          Proyectos vinculados
        </h2>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          detail="No hay proyectos publicables para esta organización."
          title="Sin proyectos disponibles"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <Card key={String(project.id)}>
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base text-[var(--text-h)]">
                    {project.name}
                  </CardTitle>
                  <Badge className="shrink-0" variant="outline">
                    {formatStatus(project.currentStatus)}
                  </Badge>
                </div>
                {project.description ? (
                  <p className="text-sm leading-6 text-[var(--text)]">
                    {project.description}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <ProjectFact
                    Icon={Leaf}
                    label="Ecosistema"
                    value={project.ecosystem ?? 'Sin dato verificado'}
                  />
                  <ProjectFact
                    Icon={CalendarDays}
                    label="Plantación"
                    value={formatDate(project.plantingDate)}
                  />
                  <ProjectFact
                    Icon={MapPin}
                    label="Ubicaciones"
                    value={formatCount(project.locationIds?.length)}
                  />
                  <ProjectFact
                    Icon={Leaf}
                    label="Especies"
                    value={
                      project.species?.length
                        ? project.species.join(', ')
                        : 'Sin dato verificado'
                    }
                  />
                </dl>
                {project.responsibleOrganizations?.length ? (
                  <div className="flex items-start gap-2 rounded-md bg-mist-50 p-3 text-sm text-[var(--text)]">
                    <UsersRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
                    <p>{project.responsibleOrganizations.map((organization) => organization.name).join(' · ')}</p>
                  </div>
                ) : null}
                <VerificationStatus verification={project.verification} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

type ProjectFactProps = {
  Icon: typeof Leaf
  label: string
  value: string
}

function ProjectFact({ Icon, label, value }: ProjectFactProps) {
  return (
    <div className="flex gap-2">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text)]">
          {label}
        </dt>
        <dd className="mt-0.5 text-[var(--text-h)]">{value}</dd>
      </div>
    </div>
  )
}
