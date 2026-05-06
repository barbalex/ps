import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'
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

// TODO: is this really needed?
import * as UC from '@uploadcare/file-uploader'
UC.defineComponents(UC)

import './style.css'
import styles from './App.module.css'

import { lightTheme } from './modules/theme.ts'
import { store, languageAtom, intlAtom } from './store.ts'



const IntlSetter = () => {
  const intl = useIntl()
  store.set(intlAtom, intl)
  return null
}

const tanstackQueryClient = new QueryClient()

export const App = () => {
  const language = useAtomValue(languageAtom, { store })
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
        <FluentProvider theme={lightTheme}>
          <div id="router-container" className={styles.routerContainer}>
            <TanstackQueryClientProvider client={tanstackQueryClient}>
              <RouterProvider router={router} />
            </TanstackQueryClientProvider>
          </div>
        </FluentProvider>
      </IntlProvider>
    </JotaiProvider>
  )
}
