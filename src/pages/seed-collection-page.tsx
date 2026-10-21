import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight, CalendarDays, Link2, MapPin, Sprout } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getSeedCollection, ImpactApiError } from '../api/impact'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { formatDate } from '../lib/formatters'
import { formatSeedQuantity, seedLocationName, seedRecordLabels, seedSpeciesName } from '../lib/seed-bank'
import type { SeedCollectionDetail } from '../types/seed-bank'

export function SeedCollectionPage() {
  const { collectionId = '' } = useParams()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [collectionId])
  const validId = /^[1-9]\d*$/.test(collectionId)
  const query = useQuery({
    queryKey: ['impact', 'seed-bank', 'collection', collectionId],
    queryFn: ({ signal }) => getSeedCollection(collectionId, signal),
    enabled: validId,
    staleTime: 60_000,
  })
  const notFound = !validId || query.error instanceof ImpactApiError && query.error.status === 404

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-forest-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" to="/semillas"><ArrowLeft aria-hidden="true" className="size-4" /> Volver al banco de semillas</Link>
        {notFound ? <ErrorState title="Recolección no disponible" detail="El registro no existe o aún no está disponible en la fuente pública." /> : query.isPending ? <LoadingState detail="Consultando la ficha pública de la recolección." /> : query.isError ? <ErrorState title="No se pudo cargar la recolección" detail="Intenta consultar el registro nuevamente." action={{ label: 'Reintentar', onClick: () => void query.refetch() }} /> : <CollectionDetail collection={query.data} />}
      </main>
    </div>
  )
}

function CollectionDetail({ collection }: { collection: SeedCollectionDetail }) {
  const blockchain = collection.blockchain
  const location = collection.ubicacion
  const hasCoordinates = location?.latitud != null && location?.longitud != null

  return (
    <>
      <section aria-labelledby="collection-title" className="rounded-2xl bg-forest-950 px-6 py-8 text-white sm:px-10 sm:py-12">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#a5cbb1]"><Sprout aria-hidden="true" className="size-4" /> Ficha pública de recolección</p>
        <p className="mt-6 break-all font-mono text-xs text-white/65">{collection.codigo_trazabilidad}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl" id="collection-title">{seedSpeciesName(collection)}</h1>
        {collection.planta.nombre_cientifico ? <p className="mt-3 text-lg italic text-[#a5cbb1]">{collection.planta.nombre_cientifico}</p> : null}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75"><span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" className="size-4" /><time dateTime={collection.fecha}>{formatDate(collection.fecha)}</time></span><span className="inline-flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{seedLocationName(collection)}</span></div>
        <p className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">{seedRecordLabels[collection.estado_registro]}</p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <section aria-labelledby="quantities-title" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-forest-950" id="quantities-title">Cantidades de esta recolección</h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div><dt className="text-sm text-[var(--text)]">Cantidad recolectada</dt><dd className="mt-2 text-3xl font-semibold tracking-tight text-forest-950 tabular-nums">{formatSeedQuantity(collection.cantidad_inicial_canonica, collection.unidad_canonica)}</dd></div>
              <div><dt className="text-sm text-[var(--text)]">Saldo disponible</dt><dd className="mt-2 text-3xl font-semibold tracking-tight text-forest-950 tabular-nums">{formatSeedQuantity(collection.saldo_actual, collection.unidad_canonica)}</dd></div>
            </dl>
            <p className="mt-6 border-t border-[var(--border)] pt-4 text-xs leading-6 text-[var(--text)]">La cantidad recolectada es el registro histórico. El saldo corresponde a lo disponible en la fuente al corte de esta consulta. {collection.unidad_canonica === 'G' ? 'El peso no permite inferir el número de semillas.' : 'Esta recolección se registró por conteo de unidades.'}</p>
          </section>

          <section aria-labelledby="origin-title" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-forest-950" id="origin-title">Origen y recolección</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <DetailValue label="Lugar de origen" value={seedLocationName(collection)} />
              <DetailValue label="Fecha de recolección" value={formatDate(collection.fecha)} />
              <DetailValue label="Método" value={collection.metodo ?? 'Método no publicado'} />
              <DetailValue label="Estado del registro" value={seedRecordLabels[collection.estado_registro]} />
              {hasCoordinates ? <DetailValue label="Coordenadas publicadas" value={`${location.latitud}, ${location.longitud}`} /> : null}
            </dl>
            {hasCoordinates ? <a className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" href={`https://www.openstreetmap.org/?mlat=${location.latitud}&mlon=${location.longitud}#map=13/${location.latitud}/${location.longitud}`} rel="noopener noreferrer" target="_blank">Ver lugar en el mapa <ArrowUpRight aria-hidden="true" className="size-4" /><span className="sr-only">(abre en otra pestaña)</span></a> : null}
            {collection.observaciones_publicas ? <div className="mt-5 border-t border-[var(--border)] pt-5"><h3 className="text-sm font-semibold text-forest-950">Observaciones</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{collection.observaciones_publicas}</p></div> : null}
          </section>
        </div>

        <section aria-labelledby="blockchain-title" className="min-w-0 rounded-2xl border border-[#d0dfcf] bg-[#eaf0e5] p-6 sm:p-8">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-forest-800"><Link2 aria-hidden="true" className="size-5" /></span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-forest-950" id="blockchain-title">Trazabilidad en Blockchain</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text)]">{blockchain?.explorer_url ? 'Consulta el registro de acuñación asociado a esta recolección en el explorador de la red.' : 'Esta recolección todavía no tiene un enlace público de acuñación. Su información de recolección sigue disponible para consulta.'}</p>
          {blockchain ? <dl className="mt-5 space-y-4 text-sm">
            {blockchain.network ? <DetailValue label="Red" value={blockchain.network} /> : null}
            {blockchain.token_id ? <DetailValue label="Token ID" value={blockchain.token_id} /> : null}
            {blockchain.transaction_hash ? <DetailValue label="Hash de transacción" value={blockchain.transaction_hash} /> : null}
            {blockchain.minted_at ? <DetailValue label="Fecha de acuñación" value={formatDate(blockchain.minted_at)} /> : null}
          </dl> : null}
          {blockchain?.explorer_url ? <a className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700" href={blockchain.explorer_url} rel="noopener noreferrer" target="_blank">Ver acuñación en Blockchain <ArrowUpRight aria-hidden="true" className="size-4" /><span className="sr-only">(abre en otra pestaña)</span></a> : null}
          <p className="mt-5 border-t border-forest-800/15 pt-4 text-xs leading-6 text-[var(--text)]">La validación del registro y su acuñación son datos distintos. El enlace se muestra únicamente cuando la fuente lo publica.</p>
        </section>
      </div>

      <section aria-labelledby="seed-photos-title" className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-forest-950" id="seed-photos-title">Fotografías de la recolección</h2>
        {collection.fotos.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{collection.fotos.map((photo, index) => <figure className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white" key={photo.id}><a aria-label={`Abrir fotografía ${index + 1} de ${collection.codigo_trazabilidad} (otra pestaña)`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700" href={photo.url} rel="noopener noreferrer" target="_blank"><img alt={photo.descripcion ?? `Fotografía ${index + 1} de la recolección ${collection.codigo_trazabilidad}`} className="aspect-[4/3] w-full object-cover" height={600} loading="lazy" src={photo.url} width={800} /></a>{photo.descripcion ? <figcaption className="p-4 text-sm leading-6 text-[var(--text)]">{photo.descripcion}</figcaption> : null}</figure>)}</div> : <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text)]">No hay fotografías públicas para este registro.</p>}
      </section>
      <p className="border-t border-[var(--border)] pt-5 text-xs text-[var(--text)]">Fuente · R3Foresta · Corte de datos: {formatDate(collection.generatedAt)}</p>
    </>
  )
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-[var(--text)]">{label}</dt><dd className="mt-1 break-words font-medium text-forest-950 [overflow-wrap:anywhere]">{value}</dd></div>
}
