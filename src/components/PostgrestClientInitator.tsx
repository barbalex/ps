import { useEffect } from 'react'
import { PostgrestClient } from '@supabase/postgrest-js'
import { useSetAtom } from 'jotai'

import { constants } from '../modules/constants.ts'

import { postgrestClientAtom } from '../store.ts'

const postgrestClientUrl = constants.getPostgrestUri()

export const PostgrestClientInitator = () => {
  const setPostgrestClient = useSetAtom(postgrestClientAtom)

  useEffect(() => {
    const postgrestClient = new PostgrestClient(postgrestClientUrl)
    setPostgrestClient(postgrestClient)
  }, [setPostgrestClient])

  return null
}
