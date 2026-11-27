import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue } from 'jotai'

import { userIdAtom } from '../store.ts'
import { projectDesignSql } from './projectDrawing.ts'

export const useMayDesignProject = (projectId?: string | null | false) => {
  const userId = useAtomValue(userIdAtom)
  const active = !!projectId && !!userId
  const result = useLiveQuery<{ allowed: boolean }>(
    active ? projectDesignSql : 'SELECT false AS allowed',
    active ? [projectId, userId] : [],
  )
  return active && result?.rows[0]?.allowed === true
}
