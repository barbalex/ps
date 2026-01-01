import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'field-types']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  fieldTypeId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useFieldTypeNavData = ({ fieldTypeId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const sql = `
      SELECT 
        field_type_id AS id,
        label
      FROM 
        field_types
      WHERE
        field_type_id = $1
    `

  const res = useLiveQuery(sql, [fieldTypeId])

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const ownArray = [...parentArray, fieldTypeId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: 'Field Type',
  }

  return { loading, navData }
}
