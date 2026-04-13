import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import {
  buildFieldNavItemLabel,
  buildFieldTableLabelMap,
  getFieldTableOptionKey,
  resolveFieldTableContext,
} from './fieldTableLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'
import { languageAtom } from '../store.ts'

type Props = {
  projectId?: string
  accountId?: string
  userId?: string
  fieldId: string
}

type NavData = {
  id: string
  label: string | null
  table_name?: string | null
  level?: number | null
  name?: string | null
}

export const useFieldNavData = ({ projectId, accountId, userId, fieldId }: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()

  const whereScope = projectId
    ? `project_id = '${projectId}'`
    : accountId
      ? `project_id IS NULL AND account_id = '${accountId}'`
      : 'project_id IS NULL'
  const fieldsSegment = projectId
    ? 'fields'
    : accountId
      ? 'project-fields'
      : 'fields'

  const res = useLiveQuery(
    `
      SELECT
        field_id AS id,
        label,
        table_name,
        level,
        name
      FROM fields
      WHERE 
        ${whereScope}
        AND field_id = $1
    `,
    [fieldId],
  )

  const projectRes = useLiveQuery(
    `SELECT ${language === 'de' ? "NULLIF(subproject_name_plural, '')" : `NULLIF(subproject_name_plural_${language}, '')`} AS name_plural, type FROM projects WHERE $1::boolean AND project_id = $2`,
    [!!projectId, projectId ?? ''],
  )

  const placeLevelsRes = useLiveQuery(
    `SELECT
      level,
      NULLIF(name_singular_${language}, '') AS name_singular,
      NULLIF(name_plural_${language}, '') AS name_plural
    FROM place_levels
    WHERE $1::boolean AND project_id = $2
    ORDER BY level`,
    [!!projectId, projectId ?? ''],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const level1Row = projectId
    ? placeLevelsRes?.rows?.find((r) => r.level === 1)
    : undefined
  const level2Row = projectId
    ? placeLevelsRes?.rows?.find((r) => r.level === 2)
    : undefined

  const tableContext = resolveFieldTableContext({
    formatMessage,
    language,
    projectType:
      (projectRes?.rows?.[0]?.type as string | null | undefined) ?? null,
    projectNamePlural:
      (projectRes?.rows?.[0]?.name_plural as string | null | undefined) ?? null,
    placeLevel1Singular:
      (level1Row?.name_singular as string | null | undefined) ?? null,
    placeLevel1Plural:
      (level1Row?.name_plural as string | null | undefined) ?? null,
    placeLevel2Singular:
      (level2Row?.name_singular as string | null | undefined) ?? null,
    placeLevel2Plural:
      (level2Row?.name_plural as string | null | undefined) ?? null,
  })

  const tableLabelMap = buildFieldTableLabelMap({
    formatMessage,
    language,
    projectType: tableContext.projectType,
    subprojectsLabel: tableContext.subprojectsLabel,
    singular1: tableContext.singular1,
    singular2: tableContext.singular2,
    plural1: tableContext.plural1,
    plural2: tableContext.plural2,
  })

  const parentArray = [
    'data',
    ...(projectId
      ? ['projects', projectId]
      : accountId
        ? userId
          ? ['users', userId, 'accounts', accountId]
          : ['accounts', accountId]
        : []),
    fieldsSegment,
  ]
  const ownArray = [...parentArray, nav?.id]
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const tableKey = getFieldTableOptionKey({
    tableName: nav?.table_name,
    level: nav?.level,
  })
  const tableLabel = tableLabelMap[tableKey] ?? nav?.table_name ?? tableKey
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : buildFieldNavItemLabel({
        tableLabel,
        fieldName: nav?.name,
        fallback: nav?.label ?? nav?.id,
      })

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: accountId
      ? formatMessage({
          id: 'field.projectFieldSingular',
          defaultMessage: 'Project Field',
        })
      : formatMessage({ id: '61ELuB', defaultMessage: 'Feld' }),
  }

  return { loading, navData }
}
