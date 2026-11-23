import type Files from '../models/public/Files.ts'

// Name of the service-worker cache holding the effectively-offline files.
// Duplicated in src/sw.ts (the service worker must not import app code);
// keep them in sync.
export const OFFLINE_FILES_CACHE = 'offline-files'

// files larger than this are never fetched for offline use (files.size,
// bytes); they show as too-large in the UI instead of silently filling the
// device's storage
export const OFFLINE_FILE_MAX_SIZE = 50 * 1000 * 1000

// fixed transforms so the cached URLs are deterministic: the list thumbnail
// (the exact transform files.tsx renders) and one preview sized for form
// and fullscreen. Form image and file preview switch to the fixed preview
// URL when a file is effectively offline — offline, only cached URLs exist.
export const offlineThumbUrl = (url: string): string =>
  `${url}-/resize/x50/-/format/auto/-/quality/smart/`
export const offlinePreviewUrl = (url: string): string =>
  `${url}-/preview/1600x1600/-/format/auto/-/quality/smart/`

// Thumb and preview are image transforms: Uploadcare rejects them (400) for
// every other mimetype (text, pdf, office documents), which would keep the
// file's status on downloading forever and re-attempt both URLs on every
// reconcile. Non-image files render from their plain URL (DocViewer, pdf
// object embed), so that is the only URL they need offline.
export const urlsOfOfflineFile = (
  url: string,
  mimetype?: string | null,
): string[] =>
  mimetype?.includes('image') ?
    [offlineThumbUrl(url), offlinePreviewUrl(url), url]
  : [url]

// the Uploadcare cdnUrl is https://ucarecdn.com/<uuid>/ (classic) or
// https://<project>.ucarecd.net/<uuid>/ (current delivery domain): the uuid
// groups a file's cache entries and identifies orphans during cleanup
export const uuidFromUrl = (url: string): string | null =>
  /^https:\/\/(?:ucarecdn\.com|[\w-]+\.ucarecd\.net)\/([^/]+)\//.exec(
    url,
  )?.[1] ?? null

export type EffectiveOfflineFile = Pick<
  Files,
  'file_id' | 'uuid' | 'url' | 'size' | 'mimetype'
>

// Effectively offline = the project gate (projects.files_offline) is on AND
// the file is marked (files.offline) or covered by its table's flag
// (place_levels.place_files_offline / action_files_offline /
// check_files_offline via the file's parent: a place file by the place's
// level, an action/check file by the level of the place they belong to).
// Files attached directly to a project or subproject have no table flag;
// only their own mark applies.
export const effectiveOfflineFilesSql = `
  SELECT t.file_id, t.uuid, t.url, t.size, t.mimetype
  FROM (
    SELECT
      f.file_id,
      f.uuid,
      f.url,
      f.size,
      f.mimetype,
      f.offline,
      CASE
        WHEN f.place_id IS NOT NULL THEN pl1.place_files_offline
        WHEN f.action_id IS NOT NULL THEN pl2.action_files_offline
        WHEN f.check_id IS NOT NULL THEN pl3.check_files_offline
        ELSE FALSE
      END AS table_flag
    FROM files f
    JOIN projects p ON p.project_id = f.project_id AND p.files_offline
    LEFT JOIN places pl ON pl.place_id = f.place_id
    LEFT JOIN place_levels pl1 ON pl1.project_id = f.project_id AND pl1.level = pl.level
    LEFT JOIN actions a ON a.action_id = f.action_id
    LEFT JOIN places apl ON apl.place_id = a.place_id
    LEFT JOIN place_levels pl2 ON pl2.project_id = f.project_id AND pl2.level = apl.level
    LEFT JOIN checks c ON c.check_id = f.check_id
    LEFT JOIN places cpl ON cpl.place_id = c.place_id
    LEFT JOIN place_levels pl3 ON pl3.project_id = f.project_id AND pl3.level = cpl.level
  ) t
  WHERE t.offline = TRUE OR t.table_flag = TRUE
`

// fetches one URL into the cache. CORS failures fall back to an opaque
// no-cors fetch (cache.add) so files stay available even without CORS
// headers — opaque responses cannot be inspected, which display-only use
// (img, object embed) tolerates.
export const downloadUrlIntoCache = async (
  cache: Cache,
  url: string,
): Promise<boolean> => {
  try {
    const response = await fetch(url)
    if (!response.ok) return false
    await cache.put(url, response)
    return true
  } catch {
    try {
      await cache.add(new Request(url, { mode: 'no-cors' }))
      return true
    } catch {
      return false
    }
  }
}

// pure status computation over the rows the manager reconciled: what the
// UI should show per file before/without any download work
export type OfflineFileStatus =
  | 'queued'
  | 'downloading'
  | 'cached'
  | 'error'
  | 'too-large'
  | 'no-url'

export type ReconcilePlan = {
  // per-file status to show immediately
  statuses: Record<string, OfflineFileStatus>
  // files whose missing URLs should be downloaded now
  toDownload: { fileId: string; urls: string[] }[]
  // cache entries to delete (URLs no longer covered by a marked file)
  toDelete: string[]
}

export const planReconcile = (
  rows: EffectiveOfflineFile[],
  cachedUrls: string[],
  canDownload: boolean,
): ReconcilePlan => {
  const desiredUrls = new Set<string>()
  const urlsByFile = new Map<string, string[]>()
  for (const row of rows) {
    if (!row.url) continue
    const urls = urlsOfOfflineFile(row.url, row.mimetype)
    for (const url of urls) desiredUrls.add(url)
    urlsByFile.set(row.file_id, urls)
  }

  const statuses: Record<string, OfflineFileStatus> = {}
  const toDownload: ReconcilePlan['toDownload'] = []
  for (const row of rows) {
    if (!row.url) {
      statuses[row.file_id] = 'no-url'
      continue
    }
    if ((row.size ?? 0) > OFFLINE_FILE_MAX_SIZE) {
      statuses[row.file_id] = 'too-large'
      continue
    }
    const urls = urlsByFile.get(row.file_id)!
    const missing = urls.filter((url) => !cachedUrls.includes(url))
    if (missing.length === 0) {
      statuses[row.file_id] = 'cached'
    } else {
      statuses[row.file_id] = canDownload ? 'downloading' : 'queued'
      if (canDownload) toDownload.push({ fileId: row.file_id, urls: missing })
    }
  }

  return {
    statuses,
    toDownload,
    toDelete: cachedUrls.filter((url) => !desiredUrls.has(url)),
  }
}
