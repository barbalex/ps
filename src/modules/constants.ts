// TODO: most of these constants are not used yet
export const projectTypeOptions: {
  value: string
  labelId: string
  defaultMessage: string
  sort: number
}[] = [
  { value: 'species', labelId: 'xE2FgH', defaultMessage: 'Arten', sort: 1 },
  { value: 'biotope', labelId: 'yI3JkL', defaultMessage: 'Biotope', sort: 2 },
]

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
