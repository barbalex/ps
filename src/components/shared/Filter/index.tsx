import { useMemo, memo, useState, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { Tab, TabList } from '@fluentui/react-components'
import { useLocation, useParams } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider.tsx'
import { Loading } from '../Loading.tsx'
import { FilterHeader } from './Header.tsx'

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
  const { user: authUser } = useCorbado()
  const { place_id, place_id2 } = useParams()
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
  // add _1 and _2 when below subproject_id
  const filterName = `filter_${tableName}${level ? `_${level}` : ''}`
  // for tableNameForTitle: replace all underscores with spaces and uppercase all first letters
  const tableNameForTitle = tableName
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
  const title = `${tableNameForTitle} Filters`

  const [activeTab, setActiveTab] = useState(1)
  const onTabSelect = useCallback((e, data) => setActiveTab(data.value), [])

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )

  const filter = useMemo(
    () =>
      appState?.[filterName]?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState, filterName],
  )
  let where = {}
  const whereUnfiltered = {}

  // add parent_id for all filterable tables below subprojects
  if (tableName === 'places') {
    where.parent_id = place_id ?? null
    whereUnfiltered.parent_id = place_id ?? null
  }
  if (['actions', 'checks', 'place_reports'].includes(tableName)) {
    where.place_id = place_id2 ?? place_id
    whereUnfiltered.place_id = place_id2 ?? place_id
  }
  // in case of multiple or filters, use: OR: [{...}, {...}]
  if (filter.length > 1) {
    where.OR = filter
  } else if (filter.length === 1) {
    where = { ...where, ...filter[0] }
  }
  // TODO: need to add parent_id when below place_id/place_id2
  const isFiltered = filter.length > 0
  const orFiltersToUse = isFiltered ? [...filter, {}] : [{}]

  console.log('hello Filter', {
    tableName,
    filterName,
    tableNameForTitle,
    title,
    level,
    where,
    whereUnfiltered,
    filter,
    place_id,
  })

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

  console.log('hello Filter', {
    results,
    resultsUnfiltered,
  })

  if (!appState) return <Loading />

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
            <Tab key={i} value={i + 1} style={tabStyle}>
              {label}
            </Tab>
          )
        })}
      </TabList>
      <OrFilter
        filterName={filterName}
        orFilters={orFiltersToUse}
        orIndex={activeTab - 1}
        appStateId={appState.app_state_id}
      />
    </div>
  )
})
