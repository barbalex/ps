import { memo, useState, useCallback } from 'react'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'
import { Tab, TabList } from '@fluentui/react-components'
import { useLocation, useParams } from 'react-router-dom'

import { FilterHeader } from './Header.tsx'
import * as stores from '../../../store.ts'
import { snakeToCamel } from '../../../modules/snakeToCamel.ts'
import { OrFilter } from './OrFilter.tsx'
import { filterAtomNameFromTableAndLevel } from '../../../modules/filterAtomNameFromTableAndLevel.ts'

import '../../../form.css'

const tabListStyle = {
  backgroundColor: 'rgba(255, 141, 2, 0.08)',
  borderBottom: '1px solid #e0e0e0',
}
const tabStyle = {
  minWidth: 60,
}

export const Filter = memo(({ level }) => {
  const { project_id, place_id, place_id2 } = useParams()
  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  // reading these values from the url path
  // if this fails in some situations, we can pass these as props
  let tableName = urlPath[urlPath.length - 2].replaceAll('-', '_')
  // TODO: if tableName is 'reports', need to specify whether: action, place, goal, subproject, project
  if (tableName === 'reports') {
    // reports can be of multiple types: action, place, goal, subproject, project
    // need to specify the type of report
    const grandParent = urlPath[urlPath.length - 4]
    // the prefix to the tableName is the grandParent without its last character (s)
    tableName = `${grandParent.slice(0, -1)}_${tableName}`
  }
  // for tableNameForTitle: replace all underscores with spaces and uppercase all first letters
  const res = useLiveIncrementalQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
    [project_id, place_id ? 2 : 1],
    'place_level_id',
  )
  const placeLevel = res?.rows?.[0]
  // const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

  const tableNameForTitle =
    tableName === 'places'
      ? placeNamePlural
      : tableName
          .split('_')
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(' ')

  const title = `${tableNameForTitle} Filters`

  const [activeTab, setActiveTab] = useState(1)
  // add 1 and 2 when below subproject_id
  const onTabSelect = useCallback((e, data) => setActiveTab(data.value), [])
  const [, setRerenderCount] = useState(0)
  const rerender = useCallback(() => setRerenderCount((c) => c + 1), [])
  const filterAtomName = filterAtomNameFromTableAndLevel({
    table: tableName,
    level,
  })
  const filterAtom = stores[filterAtomName]
  // stores.store.set(filterAtom, [])
  // ISSUE: as not using hook, need to manually subscribe to the store
  // and enforce rerender when the store changes
  stores.store.sub(filterAtom, rerender)
  const filter = stores?.store?.get?.(filterAtom) ?? []
  console.log('Filter 2', { filter })
  let where = ''
  let whereUnfiltered = ''

  // add parent_id for all filterable tables below subprojects
  if (tableName === 'places') {
    const flter = place_id ? `parent_id = '${place_id}'` : `parent_id is null`
    where += flter
    whereUnfiltered += flter
  }
  if (['actions', 'checks', 'place_reports'].includes(tableName)) {
    const flter = `place_id = '${place_id2 ?? place_id}'`
    where += flter
    whereUnfiltered += flter
  }
  if (filter.length > 0) {
    const filterString = filter.map((f) => `(${f})`).join(' OR ')
    if (where.length > 0) {
      where += ` AND (${filterString})`
    } else {
      where += filterString
    }
  }
  // TODO: need to add parent_id when below place_id/place_id2
  const isFiltered = filter.length > 0

  console.log('Filter 3', {
    tableName,
    filterName: filterAtomName,
    tableNameForTitle,
    title,
    level,
    where,
    whereUnfiltered,
    filter,
    place_id,
  })

  const resFiltered = useLiveQuery(
    `
    SELECT * 
    FROM ${tableName}
    ${where ? ` WHERE ${where} ` : ''} 
    ORDER BY label ASC`,
  )
  const results = resFiltered?.rows ?? []
  const resUnfiltered = useLiveQuery(
    `
    SELECT * 
    FROM ${tableName}
    ${whereUnfiltered ? ` WHERE ${whereUnfiltered} ` : ''} 
    ORDER BY label ASC`,
  )
  const resultsUnfiltered = resUnfiltered?.rows ?? []

  console.log('Filter 4', {
    results,
    resultsUnfiltered,
  })

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`${title} (${results.length}/${resultsUnfiltered.length})`}
        filterName={filterAtomName}
        isFiltered={isFiltered}
      />
      <TabList
        selectedValue={activeTab}
        onTabSelect={onTabSelect}
        style={tabListStyle}
      >
        {filter.map((f, i) => {
          const label =
            i === filter.length - 1 && filter.length > 1
              ? 'Or'
              : i === 0
              ? `Filter ${i + 1}`
              : `Or filter ${i + 1}`
          return (
            <Tab
              key={i}
              value={i + 1}
              style={tabStyle}
            >
              {label}
            </Tab>
          )
        })}
      </TabList>
      <OrFilter
        filterName={filterAtomName}
        orFilters={filter}
        orIndex={activeTab - 1}
      />
    </div>
  )
})
