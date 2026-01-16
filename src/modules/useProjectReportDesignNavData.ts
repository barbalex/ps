import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  projectReportDesignId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useProjectReportDesignNavData = ({
  projectId,
  projectReportDesignId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT
      project_report_design_id AS id,
      label 
    FROM project_report_designs 
    WHERE project_report_design_id = $1`,
    [projectReportDesignId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const label = nav?.label ?? nav?.id ?? projectReportDesignId

  const parentArray = ['data', 'projects', projectId, 'designs']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, projectReportDesignId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    id: nav?.id ?? projectReportDesignId,
    label,
    loading,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
  }

  return { loading, navData }
}
