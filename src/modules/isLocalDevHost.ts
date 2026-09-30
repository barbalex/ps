// RFC 1918 ranges: the app is loaded from the dev machine's LAN IP when
// testing on a phone, and must then use the dev backends, not production
const isPrivateNetworkHost = (host?: string) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host ?? '')

export const isLocalDevHost = () => {
  const host = window?.location?.hostname
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    isPrivateNetworkHost(host)
  )
}
