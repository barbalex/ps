import { useState } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { Tab, TabList } from '@fluentui/react-components'
import { useLocation, useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { FilterHeader } from './Header.tsx'
import * as stores from '../../../store.ts'
import { projectsFilterAtom } from '../../../store.ts'
import { OrFilter } from './OrFilter.tsx'
import { filterAtomNameFromTableAndLevel } from '../../../modules/filterAtomNameFromTableAndLevel.ts'
import { orFilterToSql } from '../../../modules/orFilterToSql.ts'
import { filterStringFromFilter } from '../../../modules/filterStringFromFilter.ts'
import styles from './index.module.css'
import '../../../form.css'
import type PlaceLevels from '../../../models/public/PlaceLevels.ts'

const getFilterStrings = ({
  filter,
  placeId,
  placeId2,
  projectId,
  subprojectId,
  tableName,
}) => {
  if (tableName === 'users') {
    filter = filter.map((orFilter) =>
      Object.fromEntries(
        Object.entries(orFilter).filter(
          ([key]) =>
            key === 'email' || key === 'label' || key.startsWith('data.'),
        ),
      ),
    )
  }

  let whereUnfiltered
  // add parent_id for all filterable tables below subprojects
  if (tableName === 'places') {
    const parentFilter = { parent_id: placeId ?? null }
    for (const orFilter of filter) {
      Object.assign(orFilter, parentFilter)
    }
    if (!filter.length) filter.push(parentFilter)
    whereUnfiltered = parentFilter
  }
  if (
    ['actions', 'checks', 'place_reports', 'place_users'].includes(tableName)
  ) {
    const placeFilter = { place_id: placeId2 ?? placeId }
    for (const orFilter of filter) {
      Object.assign(orFilter, placeFilter)
    }
    if (!filter.length) filter.push(placeFilter)
    whereUnfiltered = placeFilter
  }
  // tables that need to be filtered by project_id
  if (['fields'].includes(tableName)) {
    const projectFilter = { project_id: projectId ?? null }
    for (const orFilter of filter) {
      Object.assign(orFilter, projectFilter)
    }
    if (!filter.length) filter.push(projectFilter)
    whereUnfiltered = projectFilter
  }
  if (['subproject_taxa'].includes(tableName)) {
    const subprojectFilter = { subproject_id: subprojectId ?? null }
    for (const orFilter of filter) {
      Object.assign(orFilter, subprojectFilter)
    }
    if (!filter.length) filter.push(subprojectFilter)
    whereUnfiltered = subprojectFilter
  }
  const whereFilteredString = filterStringFromFilter(filter)
  const whereUnfilteredString = whereUnfiltered
    ? orFilterToSql(whereUnfiltered)
    : ''

  return { whereUnfilteredString, whereFilteredString }
}

const getTitle = ({ tableName, placeNamePlural }) => {
  // for tableNameForTitle: replace all underscores with spaces and uppercase all first letters
  const tableNameForTitle =
    tableName === 'places'
      ? placeNamePlural
      : tableName
          .split('_')
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(' ')

  const title = `${tableNameForTitle} Filters`
  return title
}

const getTableName = (urlPath) => {
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
  if (tableName === 'users') {
    const usersIndex = urlPath.lastIndexOf('users')
    const parentCollection = usersIndex > 1 ? urlPath[usersIndex - 2] : null
    if (parentCollection === 'projects') tableName = 'project_users'
    if (parentCollection === 'subprojects') tableName = 'subproject_users'
    if (parentCollection === 'places') tableName = 'place_users'
  }
  return tableName
}

export const Filter = ({
  level,
  from,
  children,
  tableNameOverride,
  filterAtomNameOverride,
}) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  const inferredTableName = getTableName(urlPath)
  const tableName = tableNameOverride ?? inferredTableName

  const resPlaceLevel = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
    [projectId, placeId ? 2 : 1],
  )
  const placeLevel: PlaceLevels = resPlaceLevel?.rows?.[0]
  // const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

  const title = getTitle({ tableName, placeNamePlural })

  const [activeTab, setActiveTab] = useState(1)
  // add 1 and 2 when below subproject_id
  const onTabSelect = (e, data) => setActiveTab(data.value)
  const filterAtomName =
    filterAtomNameOverride ??
    filterAtomNameFromTableAndLevel({
      table: tableName,
      level,
    })
  // ensure atom exists - got errors when it didn't
  const filterAtom = stores[filterAtomName] ?? projectsFilterAtom
  const [filter] = useAtom(filterAtom)

  const { whereUnfilteredString, whereFilteredString } = getFilterStrings({
    filter,
    placeId,
    placeId2,
    projectId,
    subprojectId,
    tableName,
  })

  // console.log('Filter 3', {
  //   tableName,
  //   filterAtomName,
  //   title,
  //   level,
  //   whereUnfilteredString,
  //   whereFilteredString,
  //   filter,
  //   place_id,
  //   project_id,
  // })

  const sql = `
      SELECT 
        (
          SELECT count(*)
          FROM ${tableName}
          ${whereFilteredString ? ` WHERE ${whereFilteredString} ` : ''}
      ) as filtered_count,
      (
        SELECT count(*)
        FROM ${tableName}
        ${whereUnfilteredString ? ` WHERE ${whereUnfilteredString} ` : ''}
      ) as total_count  
      FROM ${tableName}
      limit 1
    `
  const res = useLiveQuery(sql)
  const isLoading = res === undefined
  const row = res?.rows?.[0]
  const filteredCount = row?.filtered_count ?? 0
  const totalCount = row?.total_count ?? 0

  // console.log('Filter 4, res:', {
  //   res,
  //   row,
  //   filteredCount,
  //   totalCount,
  //   isLoading,
  //   sql,
  // })

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`${title} (${isLoading ? `...` : filteredCount}/${
          isLoading ? `...` : totalCount
        })`}
        filterAtom={filterAtom}
      />
      <TabList
        selectedValue={activeTab}
        onTabSelect={onTabSelect}
        className={styles.tabList}
      >
        {filter.map((f, i) => {
          const label =
            i === filter.length - 1 && filter.length > 1
              ? 'Or'
              : i === 0
                ? `Filter ${i + 1}`
                : `Or filter ${i + 1}`
          return (
            <Tab key={i} value={i + 1} className={styles.tab}>
              {label}
            </Tab>
          )
        })}
      </TabList>
      <OrFilter
        filterName={filterAtomName}
        orFilters={filter}
        orIndex={activeTab - 1}
        children={children}
      />
    </div>
  )
}
