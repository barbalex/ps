import { memo, useState, useCallback } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { Tab, TabList } from '@fluentui/react-components'
import { useLocation, useParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { FilterHeader } from './Header.tsx'
import * as stores from '../../../store.ts'
import { snakeToCamel } from '../../../modules/snakeToCamel.ts'

import '../../../form.css'
import { OrFilter } from './OrFilter.tsx'

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
  const db = usePGlite()

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

  const { results: placeLevel } = useLiveQuery(
    db.place_levels.liveFirst({
      where: {
        project_id,
        level: place_id ? 2 : 1,
      },
      orderBy: { label: 'asc' },
    }),
  )
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
  const filterName = `${snakeToCamel(tableName)}${
    level ? `${level}` : ''
  }FilterAtom`
  const onTabSelect = useCallback((e, data) => setActiveTab(data.value), [])
  // console.log('Filter 1', {
  //   filterObject,
  //   filterName,
  //   tableName,
  // })
  const [, setRerenderCount] = useState(0)
  const rerender = useCallback(() => setRerenderCount((c) => c + 1), [])
  const filterAtom = stores[filterName]
  // ISSUE: as not using hook, need to manually subscribe to the store
  // and enforce rerender when the store changes
  stores.store.sub(filterAtom, rerender)
  const filter = stores?.store?.get?.(filterAtom) ?? []
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
  if (filter) {
    where += ` AND ${filter}`
  }
  // TODO: need to add parent_id when below place_id/place_id2
  const isFiltered = !!filter
  const orFiltersToUse = isFiltered ? [...filter, {}] : [{}]

  // console.log('Filter 3', {
  //   tableName,
  //   filterName,
  //   tableNameForTitle,
  //   title,
  //   level,
  //   where,
  //   whereUnfiltered,
  //   filter,
  //   place_id,
  // })

  const resFiltered = useLiveQuery(`SELECT * FROM ${tableName} WHERE ${where}`)
  const { results = [] } = useLiveQuery(
    db?.[tableName]?.liveMany({
      orderBy: { label: 'asc' },
      where,
    }),
  )
  const { results: resultsUnfiltered = [] } = useLiveQuery(
    db?.[tableName].liveMany({
      where: whereUnfiltered,
      orderBy: { label: 'asc' },
    }),
  )

  // console.log('Filter 4', {
  //   results,
  //   resultsUnfiltered,
  // })

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`${title} (${results.length}/${resultsUnfiltered.length})`}
        filterName={filterName}
        isFiltered={isFiltered}
      />
      <TabList
        selectedValue={activeTab}
        onTabSelect={onTabSelect}
        style={tabListStyle}
      >
        {orFiltersToUse.map((f, i) => {
          const label =
            i === orFiltersToUse.length - 1 && orFiltersToUse.length > 1
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
        filterName={filterName}
        orFilters={orFiltersToUse}
        orIndex={activeTab - 1}
      />
    </div>
  )
})
