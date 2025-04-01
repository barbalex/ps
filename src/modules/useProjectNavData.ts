import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { treeOpenNodesAtom } from '../store.ts'

export const useProjectNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { projectId } = useParams({ strict: false })

  const res = useLiveQuery(
    `
      SELECT
        project_id AS id,
        label 
      FROM projects
      WHERE project_id = $1`,
    [projectId],
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

        return {
          isInActiveNodeArray,
          isActive,
          isOpen,
          level: 2,
          parentUrl,
          ownArray,
          urlPath,
          ownUrl,
          toParams: {},
          label: row.label,
          // nameSingular: 'Project',
          navs:{},
        }
  }, [])
}
