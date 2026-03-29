import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { TbHistory } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { useLiveQuery } from '@electric-sql/pglite-react'

import {
  addNotificationAtom,
  onlineAtom,
  postgrestClientAtom,
} from '../../../store.ts'

const { Button, Tooltip } = fluentUiReactComponents

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
  const location = useLocation()
  const navigate = useNavigate()
  const online = useAtomValue(onlineAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const projectRes = useLiveQuery(
    `SELECT enable_histories FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const historiesEnabled = projectRes?.rows?.[0]?.enable_histories === true
  const isHistoryRoute = location.pathname.startsWith(`${historiesPath}/`)

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
          title: formatMessage({
            id: 'bPlaceHistoryLoadFailedTitle',
            defaultMessage: 'Geschichte konnte nicht geladen werden',
          }),
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
            'Für diesen Ort gibt es noch keine gespeicherten Änderungen.',
        }),
        intent: 'warning',
      })
    } catch (error) {
      addNotification({
        title: formatMessage({
          id: 'bPlaceHistoryLoadFailedTitle',
          defaultMessage: 'Geschichte konnte nicht geladen werden',
        }),
        body: error instanceof Error ? error.message : String(error),
        intent: 'error',
      })
    }
  }

  if (!online || !historiesEnabled || !postgrestClient) return null

  return (
    <Tooltip
      content={formatMessage({
        id: 'bPlaceHistoryToggleShort',
        defaultMessage: 'history',
      })}
    >
      <Button size="medium" icon={<TbHistory />} onClick={onClickHistory} />
    </Tooltip>
  )
}
