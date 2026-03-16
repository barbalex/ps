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
  { value: 'reader', labelId: 'cV3WxY', defaultMessage: 'Reader', sort: 3 },
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
export const constants = {
  titleRowHeight: 52,
  mobileViewMaxWidth: 999,
  getPostgrestUri: () =>
    window?.location?.hostname === 'localhost'
      ? `http://localhost:3001`
      : 'https://api.arten-fördern.app',
  getElectricUri: () =>
    window?.location?.hostname === 'localhost'
      ? `http://localhost:3000/v1/shape`
      : 'https://electric.arten-fördern.app/v1/shape',
  getAppUri: () =>
    window?.location?.hostname === 'localhost'
      ? `http://localhost`
      : `https://${window.location.hostname}`,
}
