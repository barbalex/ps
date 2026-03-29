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

import { onlineAtom, postgrestClientAtom } from '../../../store.ts'

type HistoryRowLike = Record<string, unknown>

const getHistoryRecordId = (history: HistoryRowLike): string | null => {
  const updatedAt = history.updated_at
  if (updatedAt) return String(updatedAt)
  return null
}

type UseHistoryRecordsArgs = {
  historyTable: string
  rowIdField: string
  rowId: string | undefined
  historyPath: string
  routeHistoryUpdatedAt: string | undefined
  currentRow: Record<string, unknown> | undefined
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
  routeHistoryUpdatedAt,
  currentRow,
}: UseHistoryRecordsArgs): UseHistoryRecordsResult<TRow> => {
  const online = useAtomValue(onlineAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)
  const navigate = useNavigate()

  const {
    data: historiesRaw,
    isLoading: loadingHistories,
    error: historyQueryError,
  } = useQuery({
    queryKey: [historyTable, rowId],
    queryFn: async ({ signal }) => {
      const { data, error } = await postgrestClient!
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
  })

  const histories = useMemo(() => {
    if (!historiesRaw) return [] as TRow[]
    const currentRowMissing = !currentRow
    return historiesRaw.map((history, index) => ({
      ...history,
      deleted: currentRowMissing && index === 0,
    })) as TRow[]
  }, [historiesRaw, currentRow])

  const historyError: string | null = historyQueryError
    ? historyQueryError.message
    : null

  // Redirects to the first valid history id when the current route param
  // doesn't match any available record (e.g. after a deletion).
  useEffect(() => {
    if (!histories.length) return
    const hasMatchingRouteHistory =
      !!routeHistoryUpdatedAt &&
      histories.some(
        (history) => getHistoryRecordId(history) === routeHistoryUpdatedAt,
      )
    if (hasMatchingRouteHistory) return

    const firstHistoryId = getHistoryRecordId(histories[0])
    if (!firstHistoryId) return

    navigate({ to: `${historyPath}/${firstHistoryId}`, replace: true })
  }, [histories, historyPath, navigate, routeHistoryUpdatedAt])

  const selectedHistoryIndex = (() => {
    if (!histories.length || !routeHistoryUpdatedAt) return 0
    const index = histories.findIndex(
      (history) => getHistoryRecordId(history) === routeHistoryUpdatedAt,
    )
    return index >= 0 ? index : 0
  })()

  const setSelectedHistoryIndex: Dispatch<SetStateAction<number>> = useCallback(
    (nextIndexOrUpdater) => {
      if (!histories.length) return

      const nextIndex =
        typeof nextIndexOrUpdater === 'function'
          ? nextIndexOrUpdater(selectedHistoryIndex)
          : nextIndexOrUpdater

      const normalizedIndex =
        ((nextIndex % histories.length) + histories.length) % histories.length
      const nextHistoryId = getHistoryRecordId(histories[normalizedIndex])

      if (!nextHistoryId) return
      navigate({ to: `${historyPath}/${nextHistoryId}` })
    },
    [
      histories,
      historyPath,
      navigate,
      selectedHistoryIndex,
    ],
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
