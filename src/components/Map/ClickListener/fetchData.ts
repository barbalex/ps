import { store, addNotificationAtom } from '../../../store.ts'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import { httpGet } from '../../../modules/httpGet.ts'
import type { HttpGetParams } from '../../../modules/httpGet.ts'

export const fetchData = async <T = unknown>({
  url,
  params,
  layerLabel,
}: {
  url: string
  params?: HttpGetParams
  layerLabel?: string | null
}): Promise<T | undefined> => {
  let res
  try {
    res = await httpGet<T>(url, params)
  } catch (error) {
    // the request failed on the network level (offline, dns, cors, ...)
    console.error('ClickListener fetchData, network error:', error)
    store.set(addNotificationAtom, {
      title: `Fehler beim Laden der Informationen${layerLabel ? ` für ${layerLabel}` : ''}`,
      body: (error as Error).message,
      intent: 'info',
    })
    setShortTermOnlineFromFetchError(error)
    return undefined
  }

  if (res.status === 406) {
    // user clicked where no feature exists
    return undefined
  }

  if (!res.ok) {
    // the server responded with a status code that falls out of the range of 2xx
    console.error(
      'ClickListener fetchData, response error:',
      res.status,
      res.statusText,
      res.data,
    )
    store.set(addNotificationAtom, {
      title: `Fehler beim Laden der Informationen${layerLabel ? ` für ${layerLabel}` : ''}`,
      body: `${res.status} ${res.statusText}`,
      intent: 'info',
    })
    return undefined
  }

  if (!res.data) {
    return undefined
  }
  return res.data
}
