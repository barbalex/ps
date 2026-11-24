import { store, addNotificationAtom } from '../../../store.ts'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import { httpGet } from '../../../modules/httpGet.ts'
import type { HttpGetParams } from '../../../modules/httpGet.ts'

// outcome of one request. Errors carry their notification instead of showing it right
// away: while there are formats left to fall back to, a rejected one is not worth a message
export type FetchDataResult<T> =
  | { kind: 'data'; data: T }
  // 406: the user clicked where no feature exists
  | { kind: 'none' }
  // the server answered with an error status — maybe just to the format that was asked for
  | { kind: 'rejected'; notify: () => void }
  // the request failed on the network level (offline, dns, cors, ...) — no format will help
  | { kind: 'failed'; notify: () => void }

const errorTitle = (layerLabel?: string | null) =>
  `Fehler beim Laden der Informationen${layerLabel ? ` für ${layerLabel}` : ''}`

// the server answered with an OGC exception report (wms servers do so with status 200)
export const notifyServiceException = (
  layerLabel: string | null | undefined,
  message: string,
) => {
  console.error('ClickListener fetchFeatureInfo, service exception:', message)
  store.set(addNotificationAtom, {
    title: errorTitle(layerLabel),
    body: message,
    intent: 'info',
  })
}

export const fetchData = async <T = unknown>({
  url,
  params,
  layerLabel,
}: {
  url: string
  params?: HttpGetParams
  layerLabel?: string | null
}): Promise<FetchDataResult<T>> => {
  let res
  try {
    res = await httpGet<T>(url, params)
  } catch (error) {
    // the request failed on the network level (offline, dns, cors, ...)
    console.error('ClickListener fetchData, network error:', error)
    return {
      kind: 'failed',
      notify: () => {
        store.set(addNotificationAtom, {
          title: errorTitle(layerLabel),
          body: (error as Error).message,
          intent: 'info',
        })
        setShortTermOnlineFromFetchError(error)
      },
    }
  }

  if (res.status === 406) {
    // user clicked where no feature exists
    return { kind: 'none' }
  }

  if (!res.ok) {
    // the server responded with a status code that falls out of the range of 2xx
    console.error(
      'ClickListener fetchData, response error:',
      res.status,
      res.statusText,
      res.data,
    )
    return {
      kind: 'rejected',
      notify: () => {
        store.set(addNotificationAtom, {
          title: errorTitle(layerLabel),
          body: `${res.status} ${res.statusText}`,
          intent: 'info',
        })
      },
    }
  }

  if (!res.data) {
    return { kind: 'none' }
  }
  return { kind: 'data', data: res.data }
}
