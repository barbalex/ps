import WMSCapabilities from 'wms-capabilities'
import axios from 'redaxios'

import { xmlToJson } from './xmlToJson'

interface Props {
  url: string
  service?: 'WMS' | 'WFS'
}

export const getCapabilities = async ({
  url,
  service = 'WFS',
}: Props): object | undefined => {
  // Exaple url to get: https://wms.zh.ch/FnsSVOZHWMS?service=WMS&request=GetCapabilities
  let res
  try {
    // Issue: only the error logged with line 19 informs well when invalid url is used, i.e.: net::ERR_NAME_NOT_RESOLVED
    // How to catch this error? res is undefined...
    res = await axios.get(`${url}?service=${service}&request=GetCapabilities`)
  } catch (error) {
    console.error(
      `hello, getCapabilities, error fetching capabilities for ${url}`,
      error,
    )
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      error?.response?.data &&
        console.error(
          'request error with error response data:',
          error.response.data,
        )
      error?.response?.status &&
        console.error(
          'request error with error response status',
          error.response.status,
        )
      error?.response?.headers &&
        console.error(
          'request error with error response headers',
          error.response.headers,
        )
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      error?.request &&
        console.error('request error with request property:', error.request)
    }
    error?.config &&
      console.error('hello, getCapabilities, config error:', error.config)
    throw error
  }

  if (!res) return undefined

  if (!res?.data) return undefined

  if (service === 'WMS') return new WMSCapabilities().parse(res?.data)

  // is WFS
  // could WMSCapabilities be used for WFS?: new WMSCapabilities(xmlString).toJSON();
  // see: https://github.com/w8r/wms-capabilities
  const parser = new window.DOMParser()
  return xmlToJson(parser.parseFromString(res?.data, 'text/html'))
}

export default getCapabilities
