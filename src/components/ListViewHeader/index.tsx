import { memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Menu } from './Menu.tsx'

export const ListViewHeader = memo(
  ({
    namePlural,
    nameSingular,
    tableName,
    addRow,
    isFiltered,
    countFiltered,
    menus,
    info,
  }) => {
    // querying countUnfiltered here to reduce rerenders of parent
    const countSql = `SELECT count(*) FROM ${tableName}`
    const countUnfilteredResult = useLiveIncrementalQuery(countSql, [], 'count')
    const countUnfiltered = countUnfilteredResult?.rows[0]?.count ?? 0
    const title = `${namePlural} (${
      isFiltered ? `${countFiltered}/${countUnfiltered}` : countFiltered
    })`

    return (
      <>
        <div className="list-view-header">
          <h1>{title}</h1>
          <Menu
            addRow={addRow}
            tableName={nameSingular}
            menus={menus}
          />
        </div>
        {info && info}
      </>
    )
  },
)
