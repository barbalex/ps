import axios from 'redaxios'

import { constants } from './constants.ts'

const postgrestUri = constants.getPostgrestUri()
const timeout = 5000

export const isOnline = async () => {
  // if we are on localhost, we are always online
  // if (window?.location?.hostname === 'localhost') return true

  let res
  try {
    res = await axios.head(postgrestUri, { timeout })
  } catch (error) {
    // error can also be caused by timeout or net::ERR_CONNECTION_REFUSED
    return false
  }

  if (res.status === 200) return true

  return false
}
