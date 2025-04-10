import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { not } from '../css.ts'

export const useCheckNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        check_values_count AS (SELECT count(*) FROM check_values WHERE check_id = '${checkId}'),
        check_taxa_count AS (SELECT count(*) FROM check_taxa WHERE check_id = '${checkId}'),
        files_count AS (SELECT count(*) FROM files WHERE check_id = '${checkId}')
      SELECT
        check_id AS id,
        label,
        check_values_count.count AS check_values_count,
        check_taxa_count.count AS check_taxa_count,
        files_count.count AS files_count
      FROM 
        checks,
        check_values_count,
        check_taxa_count,
        files_count
      WHERE 
        checks.check_id = '${checkId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const nav = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'places',
      placeId,
      ...(placeId2 ? ['places', placeId2] : []),
      'checks',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, nav?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 2,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      navs: [
        { id: 'check', label: 'check' },
        {
          id: 'values',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.check_values_count ?? 0,
            namePlural: 'Values',
          }),
        },
        {
          id: 'taxa',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.check_taxa_count ?? 0,
            namePlural: 'Taxa',
          }),
        },
        {
          id: 'files',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.files_count ?? 0,
            namePlural: 'Files',
          }),
        },
      ],
    }
  }, [projectId, subprojectId, placeId, placeId2, nav, openNodes, res, loading])

  return { navData, loading }
}
