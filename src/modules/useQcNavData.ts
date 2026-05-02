import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { languageAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'qcs']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  qcsId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useQcNavData = ({ qcsId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
    SELECT
      qcs_id AS id,
      COALESCE(NULLIF(name_${language}, ''), name_de) AS label
    FROM qcs
    WHERE qcs_id = $1
    `,
    [qcsId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const ownArray = [...parentArray, qcsId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

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
    nameSingular: formatMessage({
      id: 'qcs.nameSingular',
      defaultMessage: 'Qualitätskontrolle',
    }),
  }

  return { loading, navData }
}
