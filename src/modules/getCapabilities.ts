import WMSCapabilities from 'wms-capabilities'
import axios from 'redaxios'

import { xmlToJson } from './xmlToJson.ts'
import { setShortTermOnlineFromFetchError } from './setShortTermOnlineFromFetchError.ts'
import {
  addNotificationAtom,
  store,
} from '../store.ts'

type FetchError = {
  message?: string
  response?: { data?: unknown; status?: number; headers?: unknown }
  request?: unknown
  config?: unknown
}

export const getCapabilities = async ({
  url,
  service = 'WFS',
}: {
  url: string
  service?: string
}): Promise<object | undefined> => {
  // Example url to get: https://wms.zh.ch/FnsSVOZHWMS?service=WMS&request=GetCapabilities
  let res
  try {
    // Issue: only the error logged with line 19 informs well when invalid url is used, i.e.: net::ERR_NAME_NOT_RESOLVED
    // How to catch this error? res is undefined...
    res = await axios.get(`${url}?service=${service}&request=GetCapabilities`)
  } catch (error) {
    const fetchError = error as FetchError
    setShortTermOnlineFromFetchError(fetchError)
    store.set(addNotificationAtom, {
      title: `Error loading capabilities for ${url}`,
      body: (fetchError?.message ?? error) as string,
      intent: 'error',
      paused: true,
    })
    if (fetchError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      fetchError?.response?.data &&
        console.error(
          'request error with error response data:',
          fetchError.response.data,
        )
      fetchError?.response?.status &&
        console.error(
          'request error with error response status',
          fetchError.response.status,
        )
      fetchError?.response?.headers &&
        console.error(
          'request error with error response headers',
          fetchError.response.headers,
        )
    } else if (fetchError.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      fetchError?.request &&
        console.error('request error with request property:', fetchError.request)
    }
    fetchError?.config &&
      console.error('hello, getCapabilities, config error:', fetchError.config)
    throw error
  }

  if (!res || !res?.data) {
    store.set(addNotificationAtom, {
      title: `Error loading capabilities for ${url}`,
      body: 'No data returned from server',
      intent: 'error',
    })
    return undefined
  }

  if (service === 'WMS')
    return new (WMSCapabilities as unknown as new () => WMSCapabilities)().parse(
      res?.data,
    )

  // is WFS
  // could WMSCapabilities be used for WFS?: new WMSCapabilities(xmlString).toJSON();
  // see: https://github.com/w8r/wms-capabilities
  const parser = new window.DOMParser()
  return xmlToJson(parser.parseFromString(res?.data, 'text/html'))
}

export default getCapabilities
