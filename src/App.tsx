import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
// from the individual package, not the @fluentui/react-components barrel:
// any import from the barrel keeps re-export bindings to every fluent
// package alive, pulling the whole suite into the eager entry chunk
import { FluentProvider } from '@fluentui/react-provider'
import { Provider as JotaiProvider, useAtomValue } from 'jotai'
import { IntlProvider, useIntl } from 'react-intl'

import { version as appVersion } from '../package.json'

import { router } from './router.tsx'

import './style.css'
import styles from './App.module.css'

import { lightTheme, darkTheme } from './modules/theme.ts'
import { markBootDone } from './modules/bootDone.ts'
import { getMessages } from './modules/i18nMessages.ts'
import { VersionCheck } from './components/VersionCheck/index.tsx'
import {
  store,
  languageAtom,
  intlAtom,
  themeModeAtom,
  type Language,
} from './store.ts'

const IntlSetter = () => {
  const intl = useIntl()
  store.set(intlAtom, intl)
  return null
}

export const App = () => {
  const language = useAtomValue(languageAtom, { store })
  const themeMode = useAtomValue(themeModeAtom, { store })

  // the active language's catalog loads lazily (i18nMessages.ts). Until the
  // first catalog arrives nothing renders and the static boot shell stays
  // visible; on later language switches the old language keeps rendering
  // until the new catalog is in, so there is no fallback-language flash
  const [ready, setReady] = useState<{
    language: Language
    messages: Record<string, string> | undefined
  } | null>(null)
  useEffect(() => {
    let isActive = true
    ;(async () => {
      const messages = await getMessages(language)
      if (isActive) setReady({ language, messages })
    })()
    return () => {
      isActive = false
    }
  }, [language])

  // track the OS color-scheme preference so 'system' mode can follow it live
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) =>
      setSystemPrefersDark(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark)

  // mirror the resolved mode onto <html> so plain CSS (style.css, component
  // modules, the boot shell) can define dark variants via [data-theme='dark'];
  // index.html sets the same attribute before first paint
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  useEffect(() => {
    const titles: Record<string, string> = {
      de: 'Arten fördern',
      en: 'Promote Species',
      fr: 'Promouvoir espèces',
      it: 'Promuovere specie',
    }
    const baseTitle = titles[language] ?? 'Arten fördern'
    document.title = `${baseTitle} ${appVersion}`
  }, [language])

  // catch-all: hide the static boot shell once any navigation has resolved
  // and rendered (routes without an explicit useMarkBootDone call)
  useEffect(() => {
    return router.subscribe('onResolved', () => markBootDone())
  }, [])

  // catalog not in yet (first load): render nothing, the boot shell covers
  // the wait. Must sit after all hooks so hook order stays stable.
  if (!ready) return null

  return (
    <JotaiProvider store={store}>
      <IntlProvider
        locale={ready.language}
        messages={ready.messages}
        onError={(err) => {
          if (err.code === 'MISSING_TRANSLATION') return
          console.error(err)
        }}
      >
        <IntlSetter />
        <FluentProvider theme={isDark ? darkTheme : lightTheme}>
          {/* version-check banner sits above the whole app, the login
              route included: a stale bundle fails everywhere */}
          <VersionCheck />
          <div
            id="router-container"
            className={styles.routerContainer}
          >
            <RouterProvider router={router} />
          </div>
        </FluentProvider>
      </IntlProvider>
    </JotaiProvider>
  )
}
