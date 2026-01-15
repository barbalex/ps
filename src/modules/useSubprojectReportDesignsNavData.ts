import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
}

type NavData = {
  id: string
  label: string
}[]

export const useSubprojectReportDesignsNavData = ({
  projectId,
  subprojectId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const sql =
    subprojectId ?
      `
    SELECT subproject_report_design_id as id, 
           coalesce(name, subproject_report_design_id::text) as label 
    FROM subproject_report_designs 
    WHERE subproject_id = '${subprojectId}' 
    ORDER BY label`
    : null

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'designs']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered: navs.length,
      namePlural: 'Report Designs',
      loading,
    }),
    nameSingular: 'Report Design',
    navs,
  }

  return { loading, navData }
}
