// see dev-documentation.md §13: the whole PGlite database lives in
// IndexedDB, which browsers may evict under storage pressure (or, on
// iOS Safari, after 7 days without site use unless the app is
// installed). persist() marks the origin's storage as persistent —
// browsers then have to keep it (Chrome surfaces a "site uses a lot of
// space" warning instead of deleting data).
export const requestPersistentStorage = async () => {
  try {
    if (!navigator.storage?.persist) return
    if (await navigator.storage.persisted()) return
    const granted = await navigator.storage.persist()
    if (!granted) {
      // no dialog was shown: the browser's own heuristics (engagement,
      // install state, bookmarks) declined — safe to request again on
      // the next app boot
      console.info('persistent storage not granted')
    }
  } catch (error) {
    console.warn('requesting persistent storage failed', error)
  }
}
