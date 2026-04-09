/**
 * Dialog that renders entity forms inside a secondary TanStack Router instance
 * backed by a memory history. The full application routeTree is reused so all
 * app routes work automatically — no manual route list to maintain.
 *
 * AuthAndDb (the /data layout route) detects DialogModeContext and renders
 * only <Outlet /> so the dialog shows just the matched form or list without
 * the full application chrome.
 *
 * All data-access contexts (PGliteProvider, JotaiProvider, IntlProvider) are
 * inherited from the outer application tree, so forms can read and write the
 * database exactly as they normally would.
 */
import { useMemo } from 'react'
import {
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import { useIntl } from 'react-intl'

import { routeTree } from '../../routeTree.gen'
import { DialogModeContext } from './DialogModeContext.ts'
import styles from './index.module.css'

const {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  Button,
  Text,
} = fluentUiReactComponents

// ── Public interface ──

interface Props {
  /** Internal app URL of the entity to show, or null to hide the dialog. */
  url: string | null
  /** Entity label shown as the dialog title. */
  label: string | null
  onClose: () => void
  /** Called when the user asks to navigate away (e.g. from the not-found fallback). */
  onNavigate: (url: string) => void
}

export const QcsResultDialog = ({ url, label, onClose, onNavigate }: Props) => {
  const { formatMessage } = useIntl()

  const router = useMemo(() => {
    if (!url) return null

    const capturedUrl = url
    const NotFoundFallback = () => {
      const { formatMessage: fmt } = useIntl()
      return (
        <div className={styles.notFoundFallback}>
          <Text>
            {fmt({
              id: 'qcsResultDialog.notMapped',
              defaultMessage:
                'Dieses Formular kann nicht im Dialog angezeigt werden.',
            })}
          </Text>
          <Button appearance="primary" onClick={() => onNavigate(capturedUrl)}>
            {fmt({
              id: 'qcsResultDialog.navigateTo',
              defaultMessage: 'Zum Formular navigieren',
            })}
          </Button>
        </div>
      )
    }

    const history = createMemoryHistory({ initialEntries: [url] })
    return createRouter({
      routeTree,
      history,
      defaultNotFoundComponent: NotFoundFallback,
    })
  }, [url, onNavigate])

  return (
    <Dialog
      open={!!url}
      onOpenChange={(_, data) => {
        if (!data.open) onClose()
      }}
    >
      <DialogSurface className={styles.dialogSurface}>
        <DialogTrigger action="close" disableButtonEnhancement>
          <Button
            appearance="subtle"
            aria-label={formatMessage({
              id: 'qcsResultDialog.close',
              defaultMessage: 'Schliessen',
            })}
            icon={<Dismiss24Regular />}
            className={styles.closeButton}
          />
        </DialogTrigger>
        <DialogBody className={styles.dialogBody}>
          <DialogTitle className={styles.dialogTitle}>
            {label ?? ''}
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {router && (
              <DialogModeContext.Provider value={true}>
                <RouterProvider router={router} />
              </DialogModeContext.Provider>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
