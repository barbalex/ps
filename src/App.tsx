import { createRef, useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { FluentProvider } = fluentUiReactComponents
import { Provider as JotaiProvider, useAtomValue } from 'jotai'
// import { PGliteWorker } from '@electric-sql/pglite/worker'
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { postgis } from '@electric-sql/pglite-postgis'
import { live } from '@electric-sql/pglite/live'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { IntlProvider, useIntl } from 'react-intl'

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
import { store, pgliteDbAtom, languageAtom, intlAtom } from './store.ts'

import { createPostgrestClient } from './modules/createPostgrestClient.ts'
createPostgrestClient()

import { initializeSql } from './modules/initializeSql.ts'

const IntlSetter = () => {
  const intl = useIntl()
  store.set(intlAtom, intl)
  return null
}

// hm. things slowed down hard when using this worker to enable multi-tab
// looked like the storage doubled as well
// const db = await PGliteWorker.create(
//   new Worker(new URL('./pglite-worker.ts', import.meta.url), {
//     type: 'module',
//   }),
//   {
//     extensions: {
//       electric: electricSync(),
//       live,
//       postgis,
//     },
//   },
// )
const db = await PGlite.create('idb://ps', {
  extensions: {
    live,
    electric: electricSync(),
    postgis,
  },
  relaxedDurability: true,
  // debug: true,
})
store.set(pgliteDbAtom, db)
// now lets initialize the db
// TODO: when login is implemented, this should probably be moved to after login, and run only once per user (not per tab)
initializeSql()

// Expose db and store on window for console debugging
if (import.meta.env.DEV) {
  window.__pglite_db__ = db
  window.__jotai_store__ = store
}

const tanstackQueryClient = new QueryClient()

export const App = () => {
  const uploaderRef = createRef<HTMLElement | null>(null)
  const language = useAtomValue(languageAtom, { store })

  useEffect(() => {
    const titles: Record<string, string> = {
      de: 'Arten fördern',
      en: 'Promote Species',
      fr: 'Promouvoir les espèces',
      it: 'Promuovere le specie',
    }
    document.title = titles[language] ?? 'Arten fördern'
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
        <PGliteProvider db={db}>
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
        </PGliteProvider>
      </IntlProvider>
    </JotaiProvider>
  )
}
