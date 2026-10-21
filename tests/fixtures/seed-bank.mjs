// FICTITIOUS records, used only by automated tests. Never imported by src/.
export const seedFixtures = Array.from({ length: 14 }, (_, index) => ({
  id: index + 1,
  codigo_trazabilidad: `PRUEBA-FICTICIA-${String(index + 1).padStart(3, '0')}`,
  tipo_material: 'SEMILLA',
  fecha: `2026-10-${String(20 - index).padStart(2, '0')}`,
  cantidad_inicial_canonica: index < 8 ? 1500 + index * 100 : 200 + index * 10,
  unidad_canonica: index < 8 ? 'G' : 'UNIDAD',
  saldo_actual: index === 1 ? null : index === 2 ? 0 : index < 8 ? 500 : 100,
  estado_registro: ['VALIDADO', 'PENDIENTE_VALIDACION', 'BORRADOR', 'RECHAZADO'][index % 4],
  planta: { id: index % 3 + 1, nombre_comun_principal: ['Tajibo de prueba', 'Molle de prueba', 'Queñua de prueba'][index % 3], nombre_cientifico: ['Handroanthus sp.', 'Schinus sp.', 'Polylepis sp.'][index % 3] },
  ubicacion: index === 13 ? null : { id: index % 3 + 1, nombre: ['Lugar de prueba A', 'Lugar de prueba B', 'Lugar de prueba C'][index % 3], division: null, pais: 'Bolivia', latitud: -16.5, longitud: -68.15 },
  blockchain: index % 2 ? null : { explorer_url: `https://explorer.example/token/test/instance/${index + 1}`, token_id: String(index + 1), transaction_hash: `0x${'a'.repeat(64)}`, network: 'Red FICTICIA de prueba', minted_at: '2026-10-21T15:00:00Z' },
}))

export const seedOverviewFixture = {
  summary: {
    collectionsCount: 14, speciesCount: 3, locationsCount: 3, mintedCollectionsCount: 7,
    lastCollectionAt: '2026-10-20',
    totalsByUnit: [
      { unit: 'G', collected: seedFixtures.filter(item => item.unidad_canonica === 'G').reduce((sum, item) => sum + item.cantidad_inicial_canonica, 0), available: null },
      { unit: 'UNIDAD', collected: seedFixtures.filter(item => item.unidad_canonica === 'UNIDAD').reduce((sum, item) => sum + item.cantidad_inicial_canonica, 0), available: 600 },
    ],
  },
  filters: {
    species: seedFixtures.slice(0, 3).map(item => ({ id: item.planta.id, commonName: item.planta.nombre_comun_principal, scientificName: item.planta.nombre_cientifico })),
    locations: seedFixtures.slice(0, 3).map(item => ({ id: item.ubicacion.id, name: item.ubicacion.nombre })),
  },
  generatedAt: '2026-10-21T19:00:00Z',
}

export function seedDetailFixture(item) {
  return { ...item, metodo: 'Método ficticio', observaciones_publicas: 'Registro FICTICIO para probar la interfaz.', fotos: item.id === 1 ? [{ id: 91, url: '/api/v1/impact/seed-bank/collections/1/photos/91', descripcion: null }] : [], generatedAt: seedOverviewFixture.generatedAt }
}
