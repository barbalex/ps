import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { MdFileUpload } from 'react-icons/md'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { onlineAtom } from '../../store.ts'
import { ImportDumpDialog } from './ImportDumpDialog.tsx'
import { useImportProjectDump } from './useImportProjectDump.ts'

// the import uploads to the server (nothing is written locally), so the
// button only exists while online
export const ImportDumpButton = () => {
  const { formatMessage } = useIntl()
  const online = useAtomValue(onlineAtom)
  const [open, setOpen] = useState(false)
  const importFile = useImportProjectDump()

  const title = formatMessage({
    id: 'pdImportTitle',
    defaultMessage: 'Aus SQL-Dumpdatei importieren',
  })

  if (!online) return null

  return (
    <>
      <Tooltip content={title} relationship="label">
        <Button
          size="medium"
          icon={<MdFileUpload />}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <ImportDumpDialog
        open={open}
        onClose={() => setOpen(false)}
        onFileSelected={(file) => void importFile(file)}
      />
    </>
  )
}
