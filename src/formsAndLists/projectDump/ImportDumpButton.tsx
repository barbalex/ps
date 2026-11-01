import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { MdFileUpload } from 'react-icons/md'
import { useIntl } from 'react-intl'

import { ImportDumpDialog } from './ImportDumpDialog.tsx'
import { useImportProjectDump } from './useImportProjectDump.ts'

export const ImportDumpButton = () => {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const importFile = useImportProjectDump()

  const title = formatMessage({
    id: 'pdImportTitle',
    defaultMessage: 'Aus SQL-Dumpdatei importieren',
  })

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
