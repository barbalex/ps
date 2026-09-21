import { validate as isUuid } from 'uuid'

export const getLastIdFromUrl = (url: string[]): string | undefined => {
  if (!url) return undefined
  if (url.length === 0) return undefined
  const last = url.at(-1)
  if (last !== undefined && isUuid(last)) {
    return last
  }
  return getLastIdFromUrl(url.slice(0, -1))
}
