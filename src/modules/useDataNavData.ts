import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'
import {
  projectsFilterAtom,
  fieldTypesFilterAtom,
  widgetTypesFilterAtom,
  widgetsForFieldsFilterAtom,
  fieldsFilterAtom,
  treeOpenNodesAtom,
  designingAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

type NavDataUnfiltered = {
  projects_count_unfiltered: number
  projects_count_filtered: number
  users_count_unfiltered: number
  accounts_count_unfiltered: number
  messages_count_unfiltered: number
}

type NavDataFiltered = {
  projects_count_unfiltered: number
  projects_count_filtered: number
  users_count_unfiltered: number
  accounts_count_unfiltered: number
  qcs_count_unfiltered?: number
  root_qcs_count_unfiltered?: number
  field_types_count_unfiltered?: number
  field_types_count_filtered?: number
  widget_types_count_unfiltered?: number
  widget_types_count_filtered?: number
  widgets_for_fields_count_unfiltered?: number
  widgets_for_fields_count_filtered?: number
  fields_count_unfiltered?: number
  fields_count_filtered?: number
  crs_count_unfiltered?: number
  messages_count_unfiltered: number
}

export const useDataNavData = () => {
  const { formatMessage } = useIntl()
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

  const [widgetsForFieldsFilter] = useAtom(widgetsForFieldsFilterAtom)
  const widgetsForFieldsFilterString = filterStringFromFilter(
    widgetsForFieldsFilter,
  )
  const widgetsForFieldsIsFiltered = !!widgetsForFieldsFilterString

  const [fieldsFilter] = useAtom(fieldsFilterAtom)
  const fieldsFilterString = filterStringFromFilter(fieldsFilter)
  const fieldsIsFiltered = !!fieldsFilterString

  const res = useLiveQuery(
    `
      WITH 
        projects_count_unfiltered AS (SELECT count(*) FROM projects),
        projects_count_filtered AS (SELECT count(*) FROM projects ${projectIsFiltered ? ` WHERE ${projectsFilterString}` : ''} ),
        users_count_unfiltered AS (SELECT count(*) FROM users),
        accounts_count_unfiltered AS (SELECT count(*) FROM accounts),
        ${
          designing
            ? ` 
            field_types_count_unfiltered AS (SELECT count(*) FROM field_types),
            field_types_count_filtered AS (SELECT count(*) FROM field_types ${fieldTypesIsFiltered ? ` WHERE ${fieldTypesFilterString}` : ''}),
            widget_types_count_unfiltered AS (SELECT count(*) FROM widget_types),
            widget_types_count_filtered AS (SELECT count(*) FROM widget_types ${widgetTypesIsFiltered ? ` WHERE ${widgetTypesFilterString}` : ''}),
            widgets_for_fields_count_unfiltered AS (SELECT count(*) FROM widgets_for_fields),
            widgets_for_fields_count_filtered AS (SELECT count(*) FROM widgets_for_fields ${widgetsForFieldsIsFiltered ? ` WHERE ${widgetsForFieldsFilterString}` : ''}),
            qcs_count_unfiltered AS (SELECT count(*) FROM qcs),
            root_qcs_count_unfiltered AS (SELECT count(*) FROM qcs_assignment WHERE project_id IS NULL AND subproject_id IS NULL),
            fields_count_unfiltered AS (SELECT count(*) FROM fields),
            fields_count_filtered AS (SELECT count(*) FROM fields ${fieldsIsFiltered ? ` WHERE ${fieldsFilterString}` : ''}),
            crs_count_unfiltered AS (SELECT count(*) FROM crs),
          `
            : ''
        }
        messages_count_unfiltered AS (SELECT count(*) FROM messages)
      SELECT
        projects_count_unfiltered.count AS projects_count_unfiltered,
        projects_count_filtered.count AS projects_count_filtered,
        users_count_unfiltered.count AS users_count_unfiltered,
        accounts_count_unfiltered.count AS accounts_count_unfiltered,
        ${
          designing
            ? `
              field_types_count_unfiltered.count AS field_types_count_unfiltered,
              field_types_count_filtered.count AS field_types_count_filtered,
              widget_types_count_unfiltered.count AS widget_types_count_unfiltered,
              widget_types_count_filtered.count AS widget_types_count_filtered,
              widgets_for_fields_count_unfiltered.count AS widgets_for_fields_count_unfiltered,
              widgets_for_fields_count_filtered.count AS widgets_for_fields_count_filtered,
              qcs_count_unfiltered.count AS qcs_count_unfiltered,
              root_qcs_count_unfiltered.count AS root_qcs_count_unfiltered,
              fields_count_unfiltered.count AS fields_count_unfiltered,
              fields_count_filtered.count AS fields_count_filtered,
              crs_count_unfiltered.count AS crs_count_unfiltered,
            `
            : ''
        }
        messages_count_unfiltered.count AS messages_count_unfiltered
      FROM 
        projects_count_unfiltered,
        projects_count_filtered,
        users_count_unfiltered,
        accounts_count_unfiltered,
        ${
          designing
            ? `
              field_types_count_unfiltered,
              field_types_count_filtered,
              widget_types_count_unfiltered,
              widget_types_count_filtered,
              widgets_for_fields_count_unfiltered,
              widgets_for_fields_count_filtered,
              qcs_count_unfiltered,
              root_qcs_count_unfiltered,
              fields_count_unfiltered,
              fields_count_filtered,
              crs_count_unfiltered,
            `
            : ''
        }
        messages_count_unfiltered
      `,
  )
  const loading = res === undefined
  const row: NavDataFiltered | NavDataUnfiltered | undefined = res?.rows?.[0]

  const parentArray = ['data']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, row?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 0,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: formatMessage({ id: 'w63miQ', defaultMessage: 'Daten' }),
    navs: [
      {
        id: 'projects',
        label: buildNavLabel({
          loading,
          isFiltered: projectIsFiltered,
          countFiltered: row?.projects_count_filtered ?? 0,
          countUnfiltered: row?.projects_count_unfiltered ?? 0,
          namePlural: formatMessage({
            id: 'x9x+dX',
            defaultMessage: 'Projekte',
          }),
        }),
      },
      {
        id: 'accounts',
        label: buildNavLabel({
          loading,
          countFiltered: row?.accounts_count_unfiltered ?? 0,
          namePlural: formatMessage({ id: '/40i9A', defaultMessage: 'Konten' }),
        }),
      },
      {
        id: 'users',
        label: buildNavLabel({
          loading,
          countFiltered: row?.users_count_unfiltered ?? 0,
          namePlural: formatMessage({
            id: 'eZ3yEB',
            defaultMessage: 'Benutzer',
          }),
        }),
      },
      ...(designing
        ? [
            {
              id: 'field-types',
              label: buildNavLabel({
                loading,
                isFiltered: fieldTypesIsFiltered,
                countFiltered: row?.field_types_count_filtered ?? 0,
                countUnfiltered: row?.field_types_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'Yx8gIR',
                  defaultMessage: 'Feld-Typen',
                }),
              }),
            },
            {
              id: 'widget-types',
              label: buildNavLabel({
                loading,
                isFiltered: widgetTypesIsFiltered,
                countFiltered: row?.widget_types_count_filtered ?? 0,
                countUnfiltered: row?.widget_types_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'U55pI0',
                  defaultMessage: 'Widget-Typen',
                }),
              }),
            },
            {
              id: 'fields',
              label: buildNavLabel({
                loading,
                isFiltered: fieldsIsFiltered,
                countFiltered: row?.fields_count_filtered ?? 0,
                countUnfiltered: row?.fields_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'I+dTZE',
                  defaultMessage: 'Felder',
                }),
              }),
            },
            {
              id: 'widgets-for-fields',
              label: buildNavLabel({
                loading,
                isFiltered: widgetsForFieldsIsFiltered,
                countFiltered: row?.widgets_for_fields_count_filtered ?? 0,
                countUnfiltered: row?.widgets_for_fields_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'bDoJBk',
                  defaultMessage: 'Widgets für Felder',
                }),
              }),
            },
            {
              id: 'qcs',
              label: buildNavLabel({
                loading,
                countFiltered: row?.qcs_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'qcs.namePlural',
                  defaultMessage: 'Qualitätskontrollen',
                }),
              }),
            },
            {
              id: 'qcs-choose',
              label: buildNavLabel({
                loading,
                countFiltered: row?.root_qcs_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'subprojectQcs.title',
                  defaultMessage: 'Qualitätskontrollen: wählen',
                }),
              }),
            },
            {
              id: 'qcs-run',
              label: buildNavLabel({
                loading,
                countFiltered: row?.root_qcs_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'subprojectQcsRun.title',
                  defaultMessage: 'Qualitätskontrollen: ausführen',
                }),
              }),
            },
            {
              id: 'crs',
              label: buildNavLabel({
                loading,
                countFiltered: row?.crs_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'OzBS9Z',
                  defaultMessage: 'KBS',
                }),
              }),
            },
          ]
        : []),
      {
        id: 'messages',
        label: buildNavLabel({
          loading,
          countFiltered: row?.messages_count_unfiltered ?? 0,
          namePlural: formatMessage({
            id: 'vHVPab',
            defaultMessage: 'Mitteilungen',
          }),
        }),
      },
    ],
  }

  return { navData, loading }
}
