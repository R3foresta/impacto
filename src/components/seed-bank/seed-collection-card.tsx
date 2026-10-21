import { ArrowUpRight, CalendarDays, MapPin, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatDate } from '../../lib/formatters'
import { formatSeedQuantity, seedLocationName, seedRecordLabels, seedSpeciesName } from '../../lib/seed-bank'
import type { SeedCollection } from '../../types/seed-bank'

export function SeedCollectionCard({ collection }: { collection: SeedCollection }) {
  const explorerUrl = collection.blockchain?.explorer_url
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-shadow hover:shadow-lg hover:shadow-forest-950/5">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] bg-[#edf2e9] px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-forest-800/10 bg-white/75 text-forest-800"><Sprout aria-hidden="true" className="size-5" /></span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${collection.estado_registro === 'VALIDADO' ? 'bg-[#dceade] text-forest-800' : 'bg-white text-[#59645a]'}`}>{seedRecordLabels[collection.estado_registro]}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="break-all font-mono text-[.7rem] tracking-wide text-forest-700">{collection.codigo_trazabilidad}</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-forest-950"><Link className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" to={`/semillas/${collection.id}`}>{seedSpeciesName(collection)}</Link></h3>
        <p className="mt-1 min-h-5 text-sm italic text-[var(--text)]">{collection.planta.nombre_cientifico ?? 'Nombre científico no publicado'}</p>
        <div className="my-5 border-y border-[var(--border)] py-4">
          <p className="text-xs text-[var(--text)]">Cantidad recolectada</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-forest-950 tabular-nums">{formatSeedQuantity(collection.cantidad_inicial_canonica, collection.unidad_canonica)}</p>
          <p className="mt-1 text-xs text-[var(--text)]">Saldo disponible · {formatSeedQuantity(collection.saldo_actual, collection.unidad_canonica)}</p>
        </div>
        <div className="mb-6 space-y-2 text-sm text-[var(--text)]">
          <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" /><span>{seedLocationName(collection)}</span></p>
          <p className="flex items-center gap-2"><CalendarDays aria-hidden="true" className="size-4 shrink-0 text-forest-700" /><time dateTime={collection.fecha}>{formatDate(collection.fecha)}</time></p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <Link aria-label={`Ver detalle de ${collection.codigo_trazabilidad}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" to={`/semillas/${collection.id}`}>Ver detalle <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          {explorerUrl ? <a aria-label={`Ver acuñación de ${collection.codigo_trazabilidad} (abre en otra pestaña)`} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-forest-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" href={explorerUrl} rel="noopener noreferrer" target="_blank">Acuñación <ArrowUpRight aria-hidden="true" className="size-3.5" /></a> : <span className="text-xs text-[var(--text)]">Sin enlace de acuñación</span>}
        </div>
      </div>
    </article>
  )
}
