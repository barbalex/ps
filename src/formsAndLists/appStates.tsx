import { memo, useCallback, useState } from 'react'
import { useAtom } from 'jotai'
import { Button, Spinner } from '@fluentui/react-components'
import { pgDump } from '@electric-sql/pglite-tools/pg_dump'
import { usePGlite } from '@electric-sql/pglite-react'
import fileDownload from 'js-file-download'

import { SwitchField } from '../components/shared/SwitchField.tsx'
import { FormHeader } from '../components/FormHeader/index.tsx'
import { breadcrumbsOverflowingAtom, navsOverflowingAtom } from '../store.ts'

import '../form.css'

export const AppStates = memo(() => {
  const [breadcrumbsOverflowing, setBreadcrumbsOverflowing] = useAtom(
    breadcrumbsOverflowingAtom,
  )
  const [navsOverflowing, setNavsOverflowing] = useAtom(navsOverflowingAtom)
  const db = usePGlite()

  const [dumping, setDumping] = useState(false)
  // TODO: second download fails: Error: pg_dump failed with exit code 1
  const downloadDump = useCallback(async () => {
    setDumping(true)
    const dump = await pgDump({ pg: db })
    // console.log('dump:', dump)
    // Create blob link to download
    // const url = URL.createObjectURL(dump)

    // const link = document.createElement('a')
    // link.href = url
    // link.download = dump.name
    // document.body.appendChild(link)
    // link.click()
    fileDownload(dump, `promoting-species.sql`)

    // Clean up and remove the link
    // link.parentNode.removeChild(link)
    // URL.revokeObjectURL(url)
    setDumping(false)
  }, [db])

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" />
      <div className="form-container">
        <SwitchField
          label="Breadcrumbs overflowing"
          value={breadcrumbsOverflowing}
          onChange={() => setBreadcrumbsOverflowing(!breadcrumbsOverflowing)}
          validationMessage="If true, breadcrumbs will only use a single line. When they overflow, the overflowing breadcrumbs will be collected in a menu on the left"
          autoFocus
        />
        <SwitchField
          label="Navs overflowing"
          value={navsOverflowing}
          onChange={() => setNavsOverflowing(!navsOverflowing)}
          validationMessage="If true, navs will only use a single line. When they overflow, the overflowing navs will be collected in a menu on the left"
        />
        <Button
          size="medium"
          icon={dumping ? <Spinner size="tiny" /> : null}
          onClick={downloadDump}
        >
          <div>{`${dumping ? 'Downloading' : 'Download'} Database Dump`}</div>
        </Button>
      </div>
    </div>
  )
})
