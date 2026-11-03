import type { Language } from '../store.ts'

// German is the app's source language: the defaultMessage of every
//FormattedMessage in the code is German, so 'de' needs no catalog. The
// other catalogs are loaded lazily — importing all of them in App.tsx put
// ~60 KiB gzipped onto every first page load when only the active
// language's catalog (~20 KiB) is ever used.
const loaders: Partial<
  Record<Language, () => Promise<{ default: Record<string, string> }>>
> = {
  en: () => import('../i18n/en.json'),
  fr: () => import('../i18n/fr.json'),
  it: () => import('../i18n/it.json'),
}

const cache = new Map<Language, Record<string, string> | undefined>()

export const getMessages = async (
  language: Language,
): Promise<Record<string, string> | undefined> => {
  if (language === 'de') return undefined
  if (!cache.has(language)) {
    const loader = loaders[language]
    if (loader) cache.set(language, (await loader()).default)
  }
  return cache.get(language)
}
