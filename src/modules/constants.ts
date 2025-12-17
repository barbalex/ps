// TODO: most of these constants are not used yet
export const constants = {
  titleRowHeight: 52,
  mobileViewMaxWidth: 999,
  getPostgrestUri: () =>
    window?.location?.hostname === 'localhost' ?
      `http://${window.location.hostname}:3001`
    : 'https://api.promote-species.app',
  getElectricUri: () =>
    window?.location?.hostname === 'localhost' ?
      `http://localhost:3000/v1/shape`
    : 'https://electric.promote-species.app/v1/shape',
  getAppUri: () =>
    window?.location?.hostname === 'localhost' ?
      `http://${window.location.hostname}`
    : `https://${window.location.hostname}`,
}
