// GET wrapper around native fetch (replaced redaxios):
// - serializes params with URLSearchParams, like redaxios did
// - rejects only on network errors (fetch's TypeError, e.g. 'Failed to fetch'),
//   NOT on http error statuses: check ok / status instead
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
  const search = params
    ? `${url.includes('?') ? '&' : '?'}${new URLSearchParams(params as Record<string, string>)}`
    : ''
  const res = await fetch(`${url}${search}`)
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
