import { PostgrestClient } from '@supabase/postgrest-js'

import { store, postgrestClientAtom } from '../store.ts'
import { constants } from './constants.ts'

const postgrestClientUrl = constants.getPostgrestUri()

export const createPostgrestClient = () => {
  const postgrestClient = new PostgrestClient(postgrestClientUrl)
  store.set(postgrestClientAtom, postgrestClient)
}
