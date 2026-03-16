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
