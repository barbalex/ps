import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { PostgrestClient } from '@supabase/postgrest-js'

import { onlineAtom } from '../../../store.ts'
import { fetchPostgrestToken } from '../../../modules/fetchPostgrestToken.ts'
import { constants } from '../../../modules/constants.ts'

type HistoryRowLike = object

const getHistoryRecordId = (history: HistoryRowLike): string | null => {
  const updatedAt = (history as Record<string, unknown>).updated_at
  if (updatedAt) return String(updatedAt)
  return null
}

type UseHistoryRecordsArgs = {
  historyTable: string
  rowIdField: string
  rowId: string | undefined
  historyPath: string
  routeHistoryId: string | undefined
  currentRow: object | undefined
}

type UseHistoryRecordsResult<TRow extends HistoryRowLike> = {
  histories: TRow[]
  loadingHistories: boolean
  historyError: string | null
  selectedHistoryIndex: number
  setSelectedHistoryIndex: Dispatch<SetStateAction<number>>
  selectedHistory: TRow | undefined
}

export const useHistoryRecords = <TRow extends HistoryRowLike>({
  historyTable,
  rowIdField,
  rowId,
  historyPath,
  routeHistoryId,
  currentRow,
}: UseHistoryRecordsArgs): UseHistoryRecordsResult<TRow> => {
  const online = useAtomValue(onlineAtom)
  const navigate = useNavigate()

  const {
    data: historiesRaw,
    isLoading: loadingHistories,
    error: historyQueryError,
  } = useQuery({
    queryKey: [historyTable, rowId],
    queryFn: async ({ signal }) => {
      const token = await fetchPostgrestToken()
      const client = new PostgrestClient(constants.getPostgrestUri(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const { data, error } = await client
        .from(historyTable)
        .select('*')
        .eq(rowIdField, rowId)
        .order('updated_at', { ascending: false })
        .abortSignal(signal)
      if (error) throw new Error(error.message)
      return data
    },
    enabled: online && !!rowId,
    staleTime: 30_000,
    // this view is route-mounted (only polls while a history page is open).
    // 10 s is plenty live for a "who changed what" view — 2 s polled the
    // server 30×/minute per open history tab for changes that are rare;
    // refetchOnWindowFocus (react-query default) still refreshes instantly
    // when the user returns to the tab
    refetchInterval: online && !!rowId ? 10_000 : false,
  })

  const histories = useMemo(() => {
    if (!historiesRaw) return [] as TRow[]
    const currentRowMissing = !currentRow
    return historiesRaw.map((history, index) => ({
      ...history,
      deleted: currentRowMissing && index === 0,
    })) as TRow[]
  }, [historiesRaw, currentRow])

  const historyError: string | null =
    historyQueryError ? historyQueryError.message : null

  // Redirects to the first valid history id when the current route param
  // doesn't match any available record (e.g. after a deletion).
  useEffect(() => {
    if (!histories.length) return
    const hasMatchingRouteHistory =
      !!routeHistoryId &&
      histories.some(
        (history) => getHistoryRecordId(history) === routeHistoryId,
      )
    if (hasMatchingRouteHistory) return

    const firstHistoryId = getHistoryRecordId(histories[0])
    if (!firstHistoryId) return

    navigate({ to: `${historyPath}/${firstHistoryId}`, replace: true })
  }, [histories, historyPath, navigate, routeHistoryId])

  const selectedHistoryIndex = (() => {
    if (!histories.length || !routeHistoryId) return 0
    const index = histories.findIndex(
      (history) => getHistoryRecordId(history) === routeHistoryId,
    )
    return index >= 0 ? index : 0
  })()

  const setSelectedHistoryIndex: Dispatch<SetStateAction<number>> = useCallback(
    (nextIndexOrUpdater) => {
      if (!histories.length) return

      const nextIndex =
        typeof nextIndexOrUpdater === 'function' ?
          nextIndexOrUpdater(selectedHistoryIndex)
        : nextIndexOrUpdater

      const normalizedIndex =
        ((nextIndex % histories.length) + histories.length) % histories.length
      const nextHistoryId = getHistoryRecordId(histories[normalizedIndex])

      if (!nextHistoryId) return
      navigate({ to: `${historyPath}/${nextHistoryId}` })
    },
    [histories, historyPath, navigate, selectedHistoryIndex],
  )

  const selectedHistory = histories[selectedHistoryIndex]

  return {
    histories,
    loadingHistories,
    historyError,
    selectedHistoryIndex,
    setSelectedHistoryIndex,
    selectedHistory,
  }
}
