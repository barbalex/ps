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
    res = await axios.get(`${url}?service=${service}&request=GetCapabilities`)
  } catch (error) {
    console.error(`error fetching capabilities for ${url}`, error)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data)
      console.error(error.response.status)
      console.error(error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      // TODO: surface
      console.error('Error', error.message)
    }
    console.error(error.config)
    throw error
  }
  if (service === 'WMS') return new WMSCapabilities().parse(res.data)

  // is WFS
  const parser = new window.DOMParser()
  return xmlToJson(parser.parseFromString(res.data, 'text/html'))
}
