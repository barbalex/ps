import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { FluentProvider } = fluentUiReactComponents
import { Provider as JotaiProvider, useAtomValue } from 'jotai'
import { IntlProvider, useIntl } from 'react-intl'

import { version as appVersion } from '../package.json'

import en from './i18n/en.json'
import fr from './i18n/fr.json'
import it from './i18n/it.json'

const messages = { en, fr, it, de: undefined } as const

import { router } from './router.tsx'

import './style.css'
import styles from './App.module.css'

import { lightTheme, darkTheme } from './modules/theme.ts'
import { markBootDone } from './modules/bootDone.ts'
import { store, languageAtom, intlAtom, themeModeAtom } from './store.ts'

const IntlSetter = () => {
  const intl = useIntl()
  store.set(intlAtom, intl)
  return null
}

export const App = () => {
  const language = useAtomValue(languageAtom, { store })
  const themeMode = useAtomValue(themeModeAtom, { store })

  // track the OS color-scheme preference so 'system' mode can follow it live
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) =>
      setSystemPrefersDark(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemPrefersDark)

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

  return (
    <JotaiProvider store={store}>
      <IntlProvider
        locale={language}
        messages={messages[language]}
        onError={(err) => {
          if (err.code === 'MISSING_TRANSLATION') return
          console.error(err)
        }}
      >
        <IntlSetter />
        <FluentProvider theme={isDark ? darkTheme : lightTheme}>
          <div id="router-container" className={styles.routerContainer}>
            <RouterProvider router={router} />
          </div>
        </FluentProvider>
      </IntlProvider>
    </JotaiProvider>
  )
}
