import WMSCapabilities from 'wms-capabilities'

import { httpGet } from './httpGet.ts'
import { xmlToJson } from './xmlToJson.ts'
import { setShortTermOnlineFromFetchError } from './setShortTermOnlineFromFetchError.ts'
import { addNotificationAtom, store } from '../store.ts'

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
    res = await httpGet<string>(
      `${url}?service=${service}&request=GetCapabilities`,
    )
  } catch (error) {
    // the request failed on the network level, i.e. net::ERR_NAME_NOT_RESOLVED or being offline
    setShortTermOnlineFromFetchError(error)
    store.set(addNotificationAtom, {
      title: `Error loading capabilities for ${url}`,
      body: (error as Error).message,
      intent: 'error',
      paused: true,
    })
    throw error
  }

  if (!res.ok) {
    // the server responded with a status code that falls out of the range of 2xx
    console.error(
      `request error with status ${res.status} ${res.statusText}:`,
      res.data,
    )
    const error = new Error(`${res.status} ${res.statusText}`)
    store.set(addNotificationAtom, {
      title: `Error loading capabilities for ${url}`,
      body: error.message,
      intent: 'error',
      paused: true,
    })
    throw error
  }

  if (!res.data) {
    store.set(addNotificationAtom, {
      title: `Error loading capabilities for ${url}`,
      body: 'No data returned from server',
      intent: 'error',
    })
    return undefined
  }

  if (service === 'WMS')
    return new (
      WMSCapabilities as unknown as new () => WMSCapabilities
    )().parse(res.data)

  // is WFS
  // could WMSCapabilities be used for WFS?: new WMSCapabilities(xmlString).toJSON();
  // see: https://github.com/w8r/wms-capabilities
  const parser = new window.DOMParser()
  return xmlToJson(parser.parseFromString(res.data, 'text/html'))
}

export default getCapabilities
