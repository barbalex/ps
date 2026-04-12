import { createRef, useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { FluentProvider } = fluentUiReactComponents
import { Provider as JotaiProvider, useAtomValue } from 'jotai'
import { IntlProvider, useIntl } from 'react-intl'
import { Analytics } from '@vercel/analytics/next'

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
import { UploaderContext } from './UploaderContext.ts'
import { store, languageAtom, intlAtom } from './store.ts'

import { createPostgrestClient } from './modules/createPostgrestClient.ts'
createPostgrestClient()

const IntlSetter = () => {
  const intl = useIntl()
  store.set(intlAtom, intl)
  return null
}

const tanstackQueryClient = new QueryClient()

export const App = () => {
  const uploaderRef = createRef<HTMLElement | null>(null)
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
          <uc-config
            ctx-name="uploadcare-uploader"
            pubkey="db67c21b6d9964e195b8"
            maxLocalFileSizeBytes="100000000"
            multiple="false"
            sourceList="local, camera, dropbox, gdrive, gphotos"
            useCloudImageEditor="true"
          ></uc-config>
          <uc-upload-ctx-provider
            id="uploaderctx"
            ctx-name="uploadcare-uploader"
            ref={uploaderRef}
          ></uc-upload-ctx-provider>
          <div id="router-container" className={styles.routerContainer}>
            <UploaderContext.Provider value={uploaderRef}>
              <TanstackQueryClientProvider client={tanstackQueryClient}>
                <RouterProvider router={router} />
              </TanstackQueryClientProvider>
            </UploaderContext.Provider>
          </div>
        </FluentProvider>
      </IntlProvider>
      <Analytics />
    </JotaiProvider>
  )
}
