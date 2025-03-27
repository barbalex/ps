import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { filesFilterAtom } from '../store.ts'

export const useFilesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
}) => {
  const { hKey, hValue } = useMemo(() => {
    if (actionId) {
      return { hKey: 'action_id', hValue: actionId }
    } else if (checkId) {
      return { hKey: 'check_id', hValue: checkId }
    } else if (placeId2) {
      return { hKey: 'place_id2', hValue: placeId2 }
    } else if (placeId) {
      return { hKey: 'place_id', hValue: placeId }
    } else if (subprojectId) {
      return { hKey: 'subproject_id', hValue: subprojectId }
    } else if (projectId) {
      return { hKey: 'project_id', hValue: projectId }
    }
    return { hKey: undefined, hValue: undefined }
  }, [actionId, checkId, placeId, placeId2, projectId, subprojectId])

  const [filter] = useAtom(filesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = `
    SELECT file_id, label, url, mimetype 
    FROM files 
    WHERE
        ${hKey ? `${hKey} = '${hValue}'` : 'true'} 
        ${isFiltered ? `AND ${filterString}` : ''} 
    ORDER BY label`
  const res = useLiveQuery(sql)

  const isLoading = res === undefined
  const navData = res?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(
    `
        SELECT count(*) 
        FROM files 
        WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'} `,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  return { isLoading, navData, isFiltered, countUnfiltered, countLoading }
}
