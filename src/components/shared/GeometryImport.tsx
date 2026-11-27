import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components'
import { useIntl } from 'react-intl'
import { FaFileImport } from 'react-icons/fa'

import type {
  GeometryTable,
  GeometryTarget,
} from '../../modules/importOwnGeometries.ts'
import { GisUpload } from './GisUpload.tsx'
import { TooltipButton } from './TooltipButton.tsx'

export function GeometryImportDialog({
  target,
  close,
}: {
  target: GeometryTarget
  close: () => void
}) {
  const { formatMessage } = useIntl()
  const [busy, setBusy] = useState(false)
  return (
    <Dialog
      open
      onOpenChange={(_, d) => {
        if (!d.open && !busy) close()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {formatMessage({
              id: 'geometryImport',
              defaultMessage: 'Geometrien importieren',
            })}
          </DialogTitle>
          <DialogContent>
            <p>
              {'rowIds' in target ?
                formatMessage({
                  id: 'geometryImportList',
                  defaultMessage:
                    'Jede UUID muss zu einem Objekt dieser Liste gehören. Bei einem Fehler wird nichts geändert.',
                })
              : formatMessage({
                  id: 'geometryImportObject',
                  defaultMessage:
                    'Alle Geometrien der gewählten Dateiebene werden in dieses Objekt importiert.',
                })
              }
            </p>
            <GisUpload
              target={target}
              onBusy={setBusy}
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={busy}
              onClick={close}
            >
              {formatMessage({
                id: 'qcsResultDialog.close',
                defaultMessage: 'Schliessen',
              })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export function GeometryListImport({
  table,
  rowIds,
}: {
  table: GeometryTable
  rowIds: string[]
}) {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  return (
    <>
      <TooltipButton
        icon={<FaFileImport />}
        disabled={!rowIds.length}
        label={formatMessage({
          id: 'geometryImport',
          defaultMessage: 'Geometrien importieren',
        })}
        onClick={() => setOpen(true)}
      />
      {open && (
        <GeometryImportDialog
          target={{ table, rowIds }}
          close={() => setOpen(false)}
        />
      )}
    </>
  )
}
