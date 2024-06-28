import axios from 'redaxios'

import { createNotification } from '../../../modules/createRows.ts'

export const fetchData = async ({ db, url, params }) => {
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
      const data = createNotification({
        title: `Fehler beim Laden der Informationen für ${layer.label}`,
        body: error.message,
        intent: 'info',
      })
      db.notifications.create({ data })
    }
  }
  if (!failedToFetch && res?.data) {
    return res.data
  }
  return undefined
}
