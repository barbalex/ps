export const chartSubjectTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'linear', labelId: 'bDWABC', defaultMessage: 'Linear', sort: 1 },
  { value: 'monotone', labelId: 'bDXBCD', defaultMessage: 'Monoton', sort: 2 },
]

export const accountTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'trial', labelId: 'fJJ0kK', defaultMessage: 'Test', sort: 1 },
  { value: 'free', labelId: 'fKK1lL', defaultMessage: 'Kostenlos', sort: 2 },
  { value: 'basic', labelId: 'fLL2mM', defaultMessage: 'Basis', sort: 3 },
  { value: 'premium', labelId: 'fMM3nN', defaultMessage: 'Premium', sort: 4 },
]

export const chartSubjectCalcMethodOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  {
    value: 'count_rows',
    labelId: 'bDxAbB',
    defaultMessage: 'Zeilen zählen',
    sort: 1,
  },
  {
    value: 'count_rows_by_distinct_field_values',
    labelId: 'bDyCcD',
    defaultMessage: 'Zeilen pro Feldwert zählen',
    sort: 2,
  },
  {
    value: 'sum_values_of_field',
    labelId: 'bDzDeE',
    defaultMessage: 'Feldwerte summieren',
    sort: 3,
  },
]

export const chartSubjectTableLevelOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: '1', labelId: 'bDUYZA', defaultMessage: '1', sort: 1 },
  { value: '2', labelId: 'bDVZAB', defaultMessage: '2', sort: 2 },
]

export const chartSubjectTableNameOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  {
    value: 'subprojects',
    labelId: 'bDOSTU',
    defaultMessage: 'Teilprojekte',
    sort: 1,
  },
  { value: 'places', labelId: 'bDPTUV', defaultMessage: 'Orte', sort: 2 },
  { value: 'checks', labelId: 'bDQUVW', defaultMessage: 'Kontrollen', sort: 3 },
  {
    value: 'check_quantities',
    labelId: 'bDRVWX',
    defaultMessage: 'Kontroll-Mengen',
    sort: 4,
  },
  {
    value: 'actions',
    labelId: 'bDSWXY',
    defaultMessage: 'Massnahmen',
    sort: 5,
  },
  {
    value: 'action_quantities',
    labelId: 'bDTXYZ',
    defaultMessage: 'Massnahmen-Mengen',
    sort: 6,
  },
]

export const chartTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'Pie', labelId: 'bDLPQR', defaultMessage: 'Kreis', sort: 1 },
  { value: 'Radar', labelId: 'bDMQRS', defaultMessage: 'Spinne', sort: 2 },
  { value: 'Area', labelId: 'bDNRST', defaultMessage: 'Fläche', sort: 3 },
]

export const vectorLayerFillRuleOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  {
    value: 'nonzero',
    labelId: 'Wx7YzA',
    defaultMessage: 'Nicht-Null',
    sort: 1,
  },
  {
    value: 'evenodd',
    labelId: 'Vw6XyZ',
    defaultMessage: 'Gerade-Ungerade',
    sort: 2,
  },
]

export const vectorLayerLineJoinOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'arcs', labelId: 'Xy8ZaB', defaultMessage: 'Bogen', sort: 1 },
  { value: 'bevel', labelId: 'Uv5WxY', defaultMessage: 'Schräg', sort: 2 },
  { value: 'miter', labelId: 'Tu4VwX', defaultMessage: 'Spitz', sort: 3 },
  {
    value: 'miter-clip',
    labelId: 'bDKOPQ',
    defaultMessage: 'Spitz (begrenzt)',
    sort: 4,
  },
  { value: 'round', labelId: 'Rs2TuV', defaultMessage: 'Rund', sort: 5 },
]

export const vectorLayerLineCapOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'butt', labelId: 'Qr1StU', defaultMessage: 'Abrupt', sort: 1 },
  { value: 'round', labelId: 'Rs2TuV', defaultMessage: 'Rund', sort: 2 },
  {
    value: 'square',
    labelId: 'St3UvW',
    defaultMessage: 'Quadratisch',
    sort: 3,
  },
]

export const vectorLayerMarkerTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'circle', labelId: 'Op9QrS', defaultMessage: 'Kreis', sort: 1 },
  { value: 'marker', labelId: 'Pq0RsT', defaultMessage: 'Marker', sort: 2 },
]

export const vectorLayerOwnTableOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'places', labelId: 'bDDHIJ', defaultMessage: 'Orte', sort: 1 },
  {
    value: 'actions',
    labelId: 'bDEIJK',
    defaultMessage: 'Massnahmen',
    sort: 2,
  },
  {
    value: 'checks',
    labelId: 'bDFJKL',
    defaultMessage: 'Kontrollen',
    sort: 3,
  },
  {
    value: 'observations_assigned',
    labelId: 'bDGKLM',
    defaultMessage: 'Beobachtungen zugeteilt',
    sort: 4,
  },
  {
    value: 'observations_assigned_lines',
    labelId: 'bDHLMN',
    defaultMessage: 'Beobachtungen zugeteilt Linien',
    sort: 5,
  },
  {
    value: 'observations_to_assess',
    labelId: 'bDIMNO',
    defaultMessage: 'Beobachtungen zu beurteilen',
    sort: 6,
  },
  {
    value: 'observations_not_to_assign',
    labelId: 'bDJNOP',
    defaultMessage: 'Beobachtungen nicht zuzuteilen',
    sort: 7,
  },
]

export const vectorLayerTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'wfs', labelId: 'nL4MnO', defaultMessage: 'WFS', sort: 1 },
  { value: 'upload', labelId: 'oP5QrS', defaultMessage: 'Upload', sort: 2 },
  {
    value: 'own',
    labelId: 'pT6UvW',
    defaultMessage: 'Eigene Tabelle',
    sort: 3,
  },
  {
    value: 'places1',
    labelId: 'qX7YzA',
    defaultMessage: 'Orte (Ebene 1)',
    sort: 4,
  },
  {
    value: 'places2',
    labelId: 'rB8CdE',
    defaultMessage: 'Orte (Ebene 2)',
    sort: 5,
  },
  {
    value: 'actions1',
    labelId: 'sF9GhI',
    defaultMessage: 'Massnahmen (Ebene 1)',
    sort: 6,
  },
  {
    value: 'actions2',
    labelId: 'tJ0KlM',
    defaultMessage: 'Massnahmen (Ebene 2)',
    sort: 7,
  },
  {
    value: 'checks1',
    labelId: 'uN1OpQ',
    defaultMessage: 'Kontrollen (Ebene 1)',
    sort: 8,
  },
  {
    value: 'checks2',
    labelId: 'vR2StU',
    defaultMessage: 'Kontrollen (Ebene 2)',
    sort: 9,
  },
  {
    value: 'observations_assigned1',
    labelId: 'wV3WxY',
    defaultMessage: 'Beobachtungen zugeteilt (Ebene 1)',
    sort: 10,
  },
  {
    value: 'observations_assigned_lines1',
    labelId: 'xZ4AbC',
    defaultMessage: 'Beobachtungen zugeteilt Linien (Ebene 1)',
    sort: 11,
  },
  {
    value: 'observations_assigned2',
    labelId: 'yD5EfG',
    defaultMessage: 'Beobachtungen zugeteilt (Ebene 2)',
    sort: 12,
  },
  {
    value: 'observations_assigned_lines2',
    labelId: 'zH6IjK',
    defaultMessage: 'Beobachtungen zugeteilt Linien (Ebene 2)',
    sort: 13,
  },
  {
    value: 'observations_to_assess',
    labelId: 'aL7MnO',
    defaultMessage: 'Beobachtungen zu beurteilen',
    sort: 14,
  },
  {
    value: 'observations_not_to_assign',
    labelId: 'bP8QrS',
    defaultMessage: 'Beobachtungen nicht zuzuteilen',
    sort: 15,
  },
]

export const observationImportGeometryMethodOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  {
    value: 'coordinates',
    labelId: 'lD2EfG',
    defaultMessage: 'Koordinaten',
    sort: 1,
  },
  { value: 'geojson', labelId: 'mH3IjK', defaultMessage: 'GeoJSON', sort: 2 },
]

export const unitTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'integer', labelId: 'iR9StU', defaultMessage: 'Ganzzahl', sort: 1 },
  {
    value: 'numeric',
    labelId: 'jV0WxY',
    defaultMessage: 'Dezimalzahl',
    sort: 2,
  },
  { value: 'text', labelId: 'kZ1AbC', defaultMessage: 'Text', sort: 3 },
]

export const listValueTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'integer', labelId: 'dW4XyZ', defaultMessage: 'Ganzzahl', sort: 1 },
  {
    value: 'numeric',
    labelId: 'eA5BcD',
    defaultMessage: 'Dezimalzahl',
    sort: 2,
  },
  { value: 'text', labelId: 'fE6FgH', defaultMessage: 'Text', sort: 3 },
  { value: 'date', labelId: 'gI7JkL', defaultMessage: 'Datum', sort: 4 },
  {
    value: 'datetime',
    labelId: 'hM8NpQ',
    defaultMessage: 'Datum & Zeit',
    sort: 5,
  },
]

export const taxonomyTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'species', labelId: 'xE2FgH', defaultMessage: 'Arten', sort: 1 },
  { value: 'biotope', labelId: 'yI3JkL', defaultMessage: 'Biotope', sort: 2 },
]

export const userRoleOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'manager', labelId: 'aM1NpQ', defaultMessage: 'Manager', sort: 1 },
  { value: 'editor', labelId: 'bR2StU', defaultMessage: 'Editor', sort: 2 },
  { value: 'reader', labelId: 'cV3WxY', defaultMessage: 'Leser', sort: 3 },
]

export const projectTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'species', labelId: 'xE2FgH', defaultMessage: 'Arten', sort: 1 },
  { value: 'biotope', labelId: 'yI3JkL', defaultMessage: 'Biotope', sort: 2 },
]

// TODO: most of these constants are not used yet
const isLocalDevHost = () => {
  const host = window?.location?.hostname
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]'
  )
}

const isPromoteSpeciesHost = () =>
  window?.location?.hostname?.endsWith('promote-species.app')

export const constants = {
  titleRowHeight: 52,
  mobileViewMaxWidth: 999,
  getPostgrestUri: () =>
    isLocalDevHost()
      ? `http://localhost:3002`
      : isPromoteSpeciesHost()
        ? 'https://api.promote-species.app'
        : 'https://api.arten-fördern.app',
  // set 3001 to go via caddy, 3000 to go directly to electric backend
  getElectricUri: () =>
    isLocalDevHost()
      ? `https://localhost:3001/v1/shape`
      : isPromoteSpeciesHost()
        ? 'https://sync.promote-species.app/v1/shape'
        : 'https://sync.arten-fördern.app/v1/shape',
  getAppUri: () =>
    isLocalDevHost()
      ? `http://localhost`
      : `https://${window.location.hostname}`,
}
