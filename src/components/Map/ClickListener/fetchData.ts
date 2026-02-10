import axios from 'redaxios'

import { store, addNotificationAtom, pgliteDbAtom } from '../../../store.ts'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'

export const fetchData = async ({ url, params, layerLabel }) => {
  const db = store.get(pgliteDbAtom)
  let res
  let failedToFetch = false
  try {
    res = await axios.get({
      method: 'get',
      url,
      params,
    })
  } catch (error) {
    console.log({ error, errorToJSON: error?.toJSON?.(), res })
    if (error.status == 406) {
      // user clicked where no feature exists
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('error.response.data', error.response.data)
      console.error('error.response.status', error.response.status)
      console.error('error.response.headers', error.response.headers)
      failedToFetch = true
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('error.request:', error.request)
      failedToFetch = true
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('error.message', error.message)
      failedToFetch = true
    }
    if (error.message?.toLowerCase()?.includes('failed to fetch')) {
      failedToFetch = true
    }
    if (failedToFetch) {
      store.set(addNotificationAtom, {
        title: `Fehler beim Laden der Informationen${layerLabel ? ` für ${layerLabel}` : ''}`,
        body: error.message,
        intent: 'info',
      })
    }
    setShortTermOnlineFromFetchError(error)
  }
  if (!failedToFetch && res?.data) {
    return res.data
  }
  return undefined
}
