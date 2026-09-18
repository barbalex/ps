import axios from 'redaxios'
import type { Options } from 'redaxios'

import { store, addNotificationAtom } from '../../../store.ts'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'

// shape of the error redaxios rejects with (a Response-like object)
type FetchError = {
  toJSON?: () => unknown
  status?: number
  response?: { data?: unknown; status?: number; headers?: unknown }
  request?: unknown
  message?: string
}

// redaxios's `get` accepts a config object at runtime (it forwards to the
// default call, whose first parameter is `string | Options`), but its typings
// only allow a url string — bridge the type locally.
const axiosGet = axios.get as unknown as (
  config: Options,
) => Promise<{ data?: unknown }>

export const fetchData = async <T = unknown>({
  url,
  params,
  layerLabel,
}: {
  url: string
  params?: Options['params']
  layerLabel?: string | null
}): Promise<T | undefined> => {
  let res: Awaited<ReturnType<typeof axiosGet>> | undefined
  let failedToFetch = false
  try {
    res = await axiosGet({
      method: 'get',
      url,
      params,
    })
  } catch (error) {
    const err = error as FetchError
    console.log({ error: err, errorToJSON: err?.toJSON?.(), res })
    if (err.status == 406) {
      // user clicked where no feature exists
    } else if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('error.response.data', err.response.data)
      console.error('error.response.status', err.response.status)
      console.error('error.response.headers', err.response.headers)
      failedToFetch = true
    } else if (err.request) {
      // The request was made but no response was received
      // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('error.request:', err.request)
      failedToFetch = true
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('error.message', err.message)
      failedToFetch = true
    }
    if (err.message?.toLowerCase()?.includes('failed to fetch')) {
      failedToFetch = true
    }
    if (failedToFetch) {
      store.set(addNotificationAtom, {
        title: `Fehler beim Laden der Informationen${layerLabel ? ` für ${layerLabel}` : ''}`,
        body: err.message,
        intent: 'info',
      })
    }
    setShortTermOnlineFromFetchError(err)
  }
  if (!failedToFetch && res?.data) {
    return res.data as T
  }
  return undefined
}
