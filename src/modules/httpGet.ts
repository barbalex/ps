// network-level failure: fetch itself rejected (offline, DNS, CORS-blocked)
// — as opposed to http error statuses, which resolve normally. Lets callers
// distinguish "maybe transient, retry later" from processing errors
export class NetworkError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options)
    this.name = 'NetworkError'
  }
}

// GET wrapper around native fetch (replaced redaxios):
// - serializes params with URLSearchParams, like redaxios did
// - rejects only on network errors (NetworkError, wrapping fetch's
//   'Failed to fetch' TypeError), NOT on http error statuses: check ok /
//   status instead
// - parses the body as json when possible, otherwise returns the raw string
export type HttpGetParams = Record<
  string,
  string | number | boolean | null | undefined
>

export const httpGet = async <T = unknown>(
  url: string,
  params?: HttpGetParams,
): Promise<{
  ok: boolean
  status: number
  statusText: string
  url: string
  data: T
}> => {
  const search =
    params ?
      `${url.includes('?') ? '&' : '?'}${new URLSearchParams(params as Record<string, string>)}`
    : ''
  let res: Response
  try {
    res = await fetch(`${url}${search}`)
  } catch (error) {
    // keep the original message ('Failed to fetch'): offline detection
    // matches on it
    throw new NetworkError((error as Error).message, { cause: error })
  }
  const text = await res.text()
  let data: unknown = text
  try {
    data = JSON.parse(text)
  } catch {
    // body is not json: keep the raw string
  }
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    url: res.url,
    data: data as T,
  }
}
