import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { pgDump } from '@electric-sql/pglite-tools/pg_dump'
import { useIntl } from 'react-intl'

import { usePGlite } from '@electric-sql/pglite-react'
import fileDownload from 'js-file-download'

export const DbDump = () => {
  const db = usePGlite()
  const { formatMessage } = useIntl()

  const [dumping, setDumping] = useState(false)
  const downloadDump = async () => {
    setDumping(true)
    const dump = await pgDump({ pg: db })
    fileDownload(dump, `arten-fördern.sql`)
    setDumping(false)
  }

  return (
    <Button
      size="medium"
      icon={dumping ? <Spinner size="tiny" /> : null}
      onClick={downloadDump}
    >
      <div>
        {dumping
          ? formatMessage({
              id: 'dbDump.downloading',
              defaultMessage: 'Alle Daten werden heruntergeladen...',
            })
          : formatMessage({
              id: 'dbDump.download',
              defaultMessage: 'Alle Daten herunterladen (als sql Datei)',
            })}
      </div>
    </Button>
  )
}
