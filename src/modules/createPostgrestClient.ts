import { PostgrestClient } from '@supabase/postgrest-js'

import { store, postgrestClientAtom } from '../store.ts'
import { constants } from './constants.ts'
import { fetchPostgrestToken } from './fetchPostgrestToken.ts'

const postgrestClientUrl = constants.getPostgrestUri()

export const createPostgrestClient = async () => {
  if (store.get(postgrestClientAtom)) return

  const token = await fetchPostgrestToken()
  const postgrestClient = new PostgrestClient(postgrestClientUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  store.set(postgrestClientAtom, postgrestClient)
}
