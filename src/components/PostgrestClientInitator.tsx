import { useEffect } from 'react'
import { PostgrestClient } from '@supabase/postgrest-js'
import { useAtom } from 'jotai'

import { postgrestClientAtom } from '../store.ts'

const postgrestClientUrl = 'http://localhost:3001'

export const PostgrestClientInitator = () => {
  const [, setPostgrestClient] = useAtom(postgrestClientAtom)

  useEffect(() => {
    const postgrestClient = new PostgrestClient(postgrestClientUrl)
    setPostgrestClient(postgrestClient)
  }, [setPostgrestClient])

  return null
}
