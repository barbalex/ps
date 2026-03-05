import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string
  active: boolean
}[]

export const useSubprojectReportDesignsNavData = ({
  projectId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const sql =
    projectId ?
      `
    SELECT subproject_report_design_id as id, 
           coalesce(name, subproject_report_design_id::text) as label,
           active
    FROM subproject_report_designs 
    WHERE project_id = '${projectId}' 
    ORDER BY label`
    : null

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = [
    'data',
    'projects',
    projectId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'subproject-designs']
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
      namePlural: formatMessage({ id: '6GiFz4', defaultMessage: 'Teilprojekt-Bericht-Designs' }),
      loading,
    }),
    nameSingular: formatMessage({ id: 'Vgm3kN', defaultMessage: 'Teilprojekt-Bericht-Design' }),
    navs,
  }

  return { loading, navData }
}
