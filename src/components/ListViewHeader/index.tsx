import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Menu } from './Menu.tsx'

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

// TODO: use locale set by user for toLocaleString
export const ListViewHeader = memo(
  ({
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
    const countSql = `SELECT count(*) FROM ${tableName}`
    const countUnfilteredResult = useLiveQuery(countSql)
    const countUnfiltered = countUnfilteredResult?.rows?.[0]?.count ?? 0
    const title = `${namePlural} (${
      isLoading
        ? '...'
        : isFiltered
        ? `${countFiltered?.toLocaleString?.(
            'en-US',
          )}/${countUnfiltered?.toLocaleString?.('en-US')}`
        : countFiltered?.toLocaleString?.('en-US')
    })`

    return (
      <>
        <div className="list-view-header">
          <h1>{title}</h1>
          <Menu
            addRow={addRow}
            nameSingular={nameSingular}
            menus={menus}
          />
        </div>
        {info && info}
      </>
    )
  },
)
