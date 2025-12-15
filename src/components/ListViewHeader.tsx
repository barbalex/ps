// seems not in use
import { useLiveQuery } from '@electric-sql/pglite-react'

import { FormMenu } from './FormMenu/index.tsx'
import { formatNumber } from '../modules/formatNumber.ts'

interface Props {
  namePlural: string
  nameSingular: string
  tableName: string
  addRow?: () => void
  isFiltered: boolean
  countFiltered: number
  menus?: unknown[]
  info?: unknown
}

export const ListViewHeader = ({
  namePlural,
  nameSingular,
  tableName,
  addRow,
  isFiltered,
  countFiltered,
  isLoading = false,
  menus,
  info,
}: Props) => {
  // querying countUnfiltered here to reduce rerenders of parent
  const countUnfilteredResult = useLiveQuery(
    `SELECT count(*) FROM ${tableName}`,
  )
  const countUnfiltered = countUnfilteredResult?.rows?.[0]?.count ?? 0
  const title = `${namePlural} (${
    isLoading ? '...'
    : isFiltered ?
      `${formatNumber(countFiltered)}/${formatNumber(countUnfiltered)}`
    : formatNumber(countFiltered)
  })`

  return (
    <>
      <div className="list-view-header">
        <h1>{title}</h1>
        <FormMenu
          addRow={addRow}
          nameSingular={nameSingular}
          siblings={menus}
        />
      </div>
      {info && info}
    </>
  )
}
