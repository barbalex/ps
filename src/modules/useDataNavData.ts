import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import {
  projectsFilterAtom,
  fieldTypesFilterAtom,
  widgetTypesFilterAtom,
  treeOpenNodesAtom,
  designingAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useDataNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)

  const [projectsFilter] = useAtom(projectsFilterAtom)
  const projectsFilterString = filterStringFromFilter(projectsFilter)
  const projectIsFiltered = !!projectsFilterString

  const [fieldTypesFilter] = useAtom(fieldTypesFilterAtom)
  const fieldTypesFilterString = filterStringFromFilter(fieldTypesFilter)
  const fieldTypesIsFiltered = !!fieldTypesFilterString

  const [widgetTypesFilter] = useAtom(widgetTypesFilterAtom)
  const widgetTypesFilterString = filterStringFromFilter(widgetTypesFilter)
  const widgetTypesIsFiltered = !!widgetTypesFilterString

  const res = useLiveQuery(
    `
      WITH 
        projects_count_unfiltered AS (SELECT count(*) FROM projects),
        projects_count_filtered AS (SELECT count(*) FROM projects ${projectIsFiltered ? ` WHERE ${projectsFilterString}` : ''} ),
        users_count_unfiltered AS (SELECT count(*) FROM users),
        accounts_count_unfiltered AS (SELECT count(*) FROM accounts)
        ${
          designing ?
            `, 
            field_types_count_unfiltered AS (SELECT count(*) FROM field_types),
            field_types_count_filtered AS (SELECT count(*) FROM field_types ${fieldTypesIsFiltered ? ` WHERE ${fieldTypesFilterString}` : ''}),
            widget_types_count_unfiltered AS (SELECT count(*) FROM widget_types),
            widget_types_count_filtered AS (SELECT count(*) FROM widget_types ${widgetTypesIsFiltered ? ` WHERE ${widgetTypesFilterString}` : ''})
          `
          : ''
        },
        messages_count_unfiltered AS (SELECT count(*) FROM messages)
      SELECT
        projects_count_unfiltered.count AS projects_count_unfiltered,
        projects_count_filtered.count AS projects_count_filtered,
        users_count_unfiltered.count AS users_count_unfiltered,
        accounts_count_unfiltered.count AS accounts_count_unfiltered
        ${
          designing ?
            `, 
              field_types_count_unfiltered.count AS field_types_count_unfiltered,
              field_types_count_filtered.count AS field_types_count_filtered,
              widget_types_count_unfiltered.count AS widget_types_count_unfiltered,
              widget_types_count_filtered.count AS widget_types_count_filtered
            `
          : ''
        },
        messages_count_unfiltered.count AS messages_count_unfiltered
      FROM 
        projects_count_unfiltered,
        projects_count_filtered,
        users_count_unfiltered,
        accounts_count_unfiltered
        ${
          designing ?
            `, 
              field_types_count_unfiltered,
              field_types_count_filtered,
              widget_types_count_unfiltered,
              widget_types_count_filtered
            `
          : ''
        },
        messages_count_unfiltered
      `,
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 0,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: 'Data',
      // nameSingular: 'Project',
      navs: [
        {
          id: 'projects',
          label: buildNavLabel({
            loading,
            isFiltered: projectIsFiltered,
            countFiltered: row?.projects_count_filtered ?? 0,
            countUnfiltered: row?.projects_count_unfiltered ?? 0,
            namePlural: 'Projects',
          }),
        },
        {
          id: 'users',
          label: buildNavLabel({
            loading,
            countFiltered: row?.users_count_unfiltered ?? 0,
            namePlural: 'Users',
          }),
        },
        {
          id: 'accounts',
          label: buildNavLabel({
            loading,
            countFiltered: row?.accounts_count_unfiltered ?? 0,
            namePlural: 'Accounts',
          }),
        },
        ...(designing ?
          [
            {
              id: 'field-types',
              label: buildNavLabel({
                loading,
                isFiltered: fieldTypesIsFiltered,
                countFiltered: row?.field_types_count_filtered ?? 0,
                countUnfiltered: row?.field_types_count_unfiltered ?? 0,
                namePlural: 'Field Types',
              }),
            },
            {
              id: 'widget-types',
              label: buildNavLabel({
                loading,
                isFiltered: widgetTypesIsFiltered,
                countFiltered: row?.widget_types_count_filtered ?? 0,
                countUnfiltered: row?.widget_types_count_unfiltered ?? 0,
                namePlural: 'Widget Types',
              }),
            },
            {
              id: 'designing',
              label: 'Designing',
            },
          ]
        : []),
        {
          id: 'messages',
          label: buildNavLabel({
            loading,
            countFiltered: row?.messages_count_unfiltered ?? 0,
            namePlural: 'Messages',
          }),
        },
      ],
    }
  }, [
    row?.id,
    row?.projects_count_filtered,
    row?.projects_count_unfiltered,
    row?.projects_name_plural,
    row?.users_count_unfiltered,
    row?.accounts_count_unfiltered,
    row?.field_types_count_filtered,
    row?.field_types_count_unfiltered,
    row?.messages_count_unfiltered,
    openNodes,
    loading,
    projectIsFiltered,
    designing,
    fieldTypesIsFiltered,
  ])

  return { navData, loading }
}
