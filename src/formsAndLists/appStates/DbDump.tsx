import { memo, useCallback, useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { pgDump } from '@electric-sql/pglite-tools/pg_dump'
import { usePGlite } from '@electric-sql/pglite-react'
import fileDownload from 'js-file-download'

export const DbDump = memo(() => {
  const db = usePGlite()

  const [dumping, setDumping] = useState(false)
  const downloadDump = useCallback(async () => {
    setDumping(true)
    const dump = await pgDump({ pg: db })
    fileDownload(dump, `promoting-species.sql`)
    setDumping(false)
  }, [db])

  return (
    <Button
      size="medium"
      icon={dumping ? <Spinner size="tiny" /> : null}
      onClick={downloadDump}
    >
      <div>{`${dumping ? 'Downloading' : 'Download'} Database Dump`}</div>
    </Button>
  )
})
