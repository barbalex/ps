import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom, languageAtom } from '../store.ts'
import { subprojectNameSingularExpr } from './subprojectNameCols.ts'

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
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    projectId
      ? `
        SELECT
          ${subprojectNameSingularExpr(language, 'p')} AS subproject_name_singular,
          srd.subproject_report_design_id AS id,
          coalesce(srd.name, srd.subproject_report_design_id::text) AS label,
          srd.active
        FROM projects p
        LEFT JOIN subproject_report_designs srd ON srd.project_id = p.project_id
        WHERE p.project_id = $1
        ORDER BY srd.label`
      : null,
    projectId ? [projectId] : undefined,
  )

  const loading = res === undefined

  const allRows = res?.rows ?? []
  const subprojectNameSingular = allRows[0]?.subproject_name_singular
  const navs: NavData = allRows
    .filter((row) => row.id !== null)
    .map(({ id, label, active }) => ({ id, label, active }))

  const nameSingular = subprojectNameSingular
    ? `${subprojectNameSingular}-${formatMessage({ id: 'bCEhIj', defaultMessage: 'Bericht Design' })}`
    : formatMessage({ id: 'Vgm3kN', defaultMessage: 'Teilprojekt-Bericht-Design' })

  const namePlural = subprojectNameSingular
    ? `${subprojectNameSingular}-${formatMessage({ id: 'bCJkLm', defaultMessage: 'Bericht-Designs' })}`
    : formatMessage({ id: '6GiFz4', defaultMessage: 'Teilprojekt-Bericht-Designs' })

  const parentArray = ['data', 'projects', projectId]
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
      namePlural,
      loading,
    }),
    nameSingular,
    navs,
  }

  return { loading, navData }
}
