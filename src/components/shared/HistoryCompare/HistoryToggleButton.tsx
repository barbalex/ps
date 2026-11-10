import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { TbHistory } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useQuery } from '@tanstack/react-query'

import {
  addNotificationAtom,
  onlineAtom,
  postgrestClientAtom,
} from '../../../store.ts'

const { Button } = fluentUiReactComponents
// Tooltip's types require a relationship prop; this usage passes none at runtime
const Tooltip = fluentUiReactComponents.Tooltip as React.ComponentType<
  Omit<
    React.ComponentProps<typeof fluentUiReactComponents.Tooltip>,
    'relationship'
  >
>

type HistoryToggleButtonProps = {
  historiesPath: string
  formPath: string
  historyTable: string
  rowIdField: string
  rowId: string | undefined
}

export const HistoryToggleButton = ({
  historiesPath,
  formPath,
  historyTable,
  rowIdField,
  rowId,
}: HistoryToggleButtonProps) => {
  const { projectId } = useParams({ strict: false })
  const { formatMessage } = useIntl()
  const historyLoadFailedTitle = formatMessage({
    id: 'bPlaceHistoryLoadFailedTitle',
    defaultMessage: 'Geschichte konnte nicht geladen werden',
  })
  const location = useLocation()
  const navigate = useNavigate()
  const online = useAtomValue(onlineAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const projectRes = useLiveQuery(
    `SELECT enable_histories FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const historiesEnabled =
    projectId == null ? true : projectRes?.rows?.[0]?.enable_histories === true
  const isHistoryRoute = location.pathname.startsWith(`${historiesPath}/`)

  const historyExistsQuery = useQuery({
    queryKey: ['historyExists', historyTable, rowId],
    queryFn: async () => {
      if (!postgrestClient || !rowId) return false
      const { data, error } = await postgrestClient
        .from(historyTable)
        .select('updated_at')
        .eq(rowIdField, rowId)
        .order('updated_at', { ascending: false })
        .limit(1)
      if (error) throw new Error(error.message)
      return (data?.length ?? 0) > 0
    },
    enabled:
      online &&
      historiesEnabled &&
      !!postgrestClient &&
      !!rowId &&
      !isHistoryRoute,
    // history rows are append-only: once one exists the button can stay
    // enabled, so poll only until the first one appears
    refetchInterval: (query) => (query.state.data ? false : 2_000),
  })

  // unsaved rows (no rowId) can not have history either; while the check is
  // loading or failed the button stays clickable and onClickHistory notifies
  const noHistoryYet =
    !isHistoryRoute && (!rowId || historyExistsQuery.data === false)

  const onClickHistory = async () => {
    if (isHistoryRoute) {
      navigate({ to: formPath })
      return
    }

    if (!rowId || !postgrestClient) return

    try {
      const { data, error } = await postgrestClient
        .from(historyTable)
        .select('updated_at')
        .eq(rowIdField, rowId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error) {
        addNotification({
          title: historyLoadFailedTitle,
          body: error.message,
          intent: 'error',
        })
        return
      }

      const latest = data?.[0] as { updated_at?: string } | undefined
      const historyId = latest?.updated_at

      if (historyId) {
        navigate({ to: `${historiesPath}/${historyId}` })
        return
      }

      addNotification({
        title: formatMessage({
          id: 'bPlaceNoHistoryTitle',
          defaultMessage: 'Keine Geschichte vorhanden',
        }),
        body: formatMessage({
          id: 'bPlaceNoHistoryBody',
          defaultMessage:
            'Die Geschichte erscheint nach der ersten gespeicherten Änderung.',
        }),
        intent: 'warning',
      })
    } catch (error) {
      addNotification({
        title: historyLoadFailedTitle,
        body: error instanceof Error ? error.message : String(error),
        intent: 'error',
      })
    }
  }

  if (!online || !historiesEnabled || !postgrestClient) return null

  const historyButton = (
    <Button
      size="medium"
      icon={<TbHistory />}
      disabled={noHistoryYet}
      onClick={onClickHistory}
    />
  )

  const tooltipContent =
    noHistoryYet ?
      `${formatMessage({
        id: 'bPlaceNoHistoryTitle',
        defaultMessage: 'Keine Geschichte vorhanden',
      })}: ${formatMessage({
        id: 'bPlaceNoHistoryBody',
        defaultMessage:
          'Die Geschichte erscheint nach der ersten gespeicherten Änderung.',
      })}`
    : formatMessage({
        id: 'bPlaceHistoryToggleShort',
        defaultMessage: 'Geschichte',
      })

  return (
    <Tooltip content={tooltipContent}>
      {/* disabled buttons swallow pointer events, so the tooltip needs
          a wrapper to still open on hover */}
      {noHistoryYet ?
        <span>{historyButton}</span>
      : historyButton}
    </Tooltip>
  )
}
