import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
} = fluentUiReactComponents
import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { MdCloudDownload } from 'react-icons/md'
import { useIntl } from 'react-intl'

import { offlineFilesStatusAtom, offlineStorageAtom } from '../../../store.ts'

// Header button + dialog: the device's offline file status — what is cached
// (per-file marks and designers' per-table marks, see offline-files-proposal.md)
// and how much storage the app uses.
export const OfflineFiles = ({ width }: { width?: number }) => {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const statuses = useAtomValue(offlineFilesStatusAtom)
  const storage = useAtomValue(offlineStorageAtom)

  const files = Object.values(statuses)
  const count = (status: string) =>
    files.filter((fileStatus) => fileStatus === status).length

  const title = formatMessage({
    id: 'offlineFilesBtnTitle',
    defaultMessage: 'Dateien offline verfügbar',
  })

  const formatBytes = (bytes: number | undefined): string => {
    if (bytes == null) return '–'
    const mb = bytes / 1000 / 1000
    return mb >= 1000 ? `${(mb / 1000).toFixed(2)} GB` : `${Math.round(mb)} MB`
  }

  return (
    <>
      <Button
        size="medium"
        appearance="transparent"
        icon={<MdCloudDownload />}
        onClick={() => setOpen(true)}
        style={width ? { width } : undefined}
        aria-label={title}
      />
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <p>
                {formatMessage(
                  {
                    id: 'offlineFilesCountCached',
                    defaultMessage: '{count} Dateien offline gespeichert',
                  },
                  { count: files.length },
                )}
              </p>
              <p>
                {formatMessage(
                  {
                    id: 'offlineFilesCountWorking',
                    defaultMessage:
                      '{downloading} werden geladen, {queued} warten, {error} fehlgeschlagen, {tooLarge} zu gross',
                  },
                  {
                    downloading: count('downloading'),
                    queued: count('queued'),
                    error: count('error'),
                    tooLarge: count('too-large'),
                  },
                )}
              </p>
              <p>
                {formatMessage(
                  {
                    id: 'offlineFilesStorage',
                    defaultMessage:
                      'Speicherplatz der App auf diesem Gerät: {usage} von {quota}',
                  },
                  {
                    usage: formatBytes(storage?.usage),
                    quota: formatBytes(storage?.quota),
                  },
                )}
              </p>
              <p>
                {formatMessage({
                  id: 'offlineFilesHint',
                  defaultMessage:
                    'Einzelne Dateien markierst du im Datei-Formular, alle Dateien einer Tabelle in der Stufen-Konfiguration (Design-Modus).',
                })}
              </p>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>
                {formatMessage({
                  id: 'offlineFilesClose',
                  defaultMessage: 'Schliessen',
                })}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
