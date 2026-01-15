import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  subprojectReportDesignId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useSubprojectReportDesignNavData = ({
  projectId,
  subprojectId,
  subprojectReportDesignId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT
      subproject_report_design_id AS id,
      label 
    FROM subproject_report_designs 
    WHERE subproject_report_design_id = $1`,
    [subprojectReportDesignId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'designs',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, subprojectReportDesignId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    id: subprojectReportDesignId,
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: nav?.label ?? '',
  }

  return { loading, navData }
}
