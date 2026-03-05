import { createRef, useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { FluentProvider } = fluentUiReactComponents
import { Provider as JotaiProvider, useAtomValue } from 'jotai'
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { live } from '@electric-sql/pglite/live'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { useBeforeunload } from 'react-beforeunload'
import { IntlProvider } from 'react-intl'

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
// import { router } from './router/index.tsx'
import { UploaderContext } from './UploaderContext.ts'
import { store, pgliteDbAtom, languageAtom } from './store.ts'

const db = await PGlite.create('idb://ps', {
  extensions: {
    live,
    electric: electricSync(),
  },
  relaxedDurability: true,
  // debug: true, // Disabled - too verbose
})
store.set(pgliteDbAtom, db)

// Expose db and store on window for console debugging
if (import.meta.env.DEV) {
  window.__pglite_db__ = db
  window.__jotai_store__ = store
}

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

  // needed to prevent problems with relaxed durability and closing connections
  // https://github.com/electric-sql/pglite/issues/879#issuecomment-3777577150
  useBeforeunload(() => db.close())

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
                <RouterProvider router={router} />
              </UploaderContext.Provider>
            </div>
          </FluentProvider>
        </PGliteProvider>
      </IntlProvider>
    </JotaiProvider>
  )
}
