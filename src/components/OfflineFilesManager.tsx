import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import {
  OFFLINE_FILES_CACHE,
  downloadUrlIntoCache,
  effectiveOfflineFilesSql,
  planReconcile,
} from '../modules/offlineFiles.ts'
import type { EffectiveOfflineFile } from '../modules/offlineFiles.ts'
import {
  offlineFilesStatusAtom,
  offlineStorageAtom,
  onlineAtom,
} from '../store.ts'
import type { OfflineFileStatus } from '../store.ts'

type SetStatus = (
  update:
    | Record<string, OfflineFileStatus>
    | ((
        prev: Record<string, OfflineFileStatus>,
      ) => Record<string, OfflineFileStatus>),
) => void

const updateStorageEstimate = async (
  setStorage: (v: { usage: number; quota: number } | null) => void,
) => {
  try {
    const estimate = await navigator.storage?.estimate?.()
    if (estimate) {
      setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
    }
  } catch {
    // storage estimates unavailable (unsupported browser): the status view
    // simply shows no storage row
  }
}

// downloads one file's URLs sequentially, then records the result
const downloadFiles = async (
  cache: Cache,
  jobs: { fileId: string; urls: string[] }[],
  setStatus: SetStatus,
  setStorage: (v: { usage: number; quota: number } | null) => void,
) => {
  const queue = [...jobs]
  const worker = async () => {
    while (queue.length) {
      const job = queue.shift()!
      let ok = true
      for (const url of job.urls) {
        if (!(await downloadUrlIntoCache(cache, url))) ok = false
      }
      setStatus((prev) => ({
        ...prev,
        [job.fileId]: ok ? 'cached' : 'error',
      }))
    }
    await updateStorageEstimate(setStorage)
  }
  await Promise.all([worker(), worker()])
}

const reconcile = async (
  rows: EffectiveOfflineFile[],
  canDownload: boolean,
  setStatus: SetStatus,
  setStorage: (v: { usage: number; quota: number } | null) => void,
) => {
  if (!('caches' in window)) return
  const cache = await caches.open(OFFLINE_FILES_CACHE)
  const keys = await cache.keys()
  const plan = planReconcile(
    rows,
    keys.map((request) => request.url),
    canDownload,
  )

  // the cache holds exactly the marked files' URLs: entries that left the
  // effective set (unmarked, table flag off, gate off, file deleted) free
  // their space again. Downloads are awaited so a later reconcile's cleanup
  // can never race an earlier one's in-flight writes.
  await Promise.all(plan.toDelete.map((url) => cache.delete(url)))
  setStatus(plan.statuses)
  if (plan.toDownload.length) {
    await downloadFiles(cache, plan.toDownload, setStatus, setStorage)
  } else {
    await updateStorageEstimate(setStorage)
  }
}

// reconciles run serially: each one plans against the cache state the
// previous one left behind, so mark-then-unmark bursts stay ordered
let reconcileChain: Promise<void> = Promise.resolve()

/**
 * Keeps the device's offline-files cache in step with the effectively
 * offline files (marked by users, or all files of a table marked by
 * designers, gated by projects.files_offline). Mounted once in
 * LayoutProtected. See offline-files-proposal.md.
 */
export const OfflineFilesManager = () => {
  const isOnline = useAtomValue(onlineAtom)
  const setStatus = useSetAtom(offlineFilesStatusAtom)
  const setStorage = useSetAtom(offlineStorageAtom)

  const res = useLiveQuery(effectiveOfflineFilesSql)

  useEffect(() => {
    if (!res) return
    reconcileChain = reconcileChain
      .then(() =>
        reconcile(
          res.rows as EffectiveOfflineFile[],
          isOnline,
          setStatus,
          setStorage,
        ),
      )
      .catch((error) =>
        console.error('OfflineFilesManager: reconcile failed', error),
      )
  }, [res, isOnline, setStatus, setStorage])

  return null
}
