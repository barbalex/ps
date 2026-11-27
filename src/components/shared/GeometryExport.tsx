import { useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components'
import { FaFileExport } from 'react-icons/fa'
import { saveAs } from 'file-saver'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { addNotificationAtom } from '../../store.ts'
import { projectTypeOptions } from '../../modules/constants.ts'
import {
  exportOwnGeometries,
  type GeometryFormat,
} from '../../modules/exportOwnGeometries.ts'
import type { GeometryTable } from '../../modules/importOwnGeometries.ts'

const formats = {
  gpkg: 'GeoPackage',
  geojson: 'GeoJSON',
  csv: 'CSV (WKT)',
  kml: 'KML',
} as const

export function GeometryExport({
  table,
  rowIds,
}: {
  table: GeometryTable
  rowIds: string[]
}) {
  const db = usePGlite()
  const notify = useSetAtom(addNotificationAtom)
  const { formatMessage } = useIntl()
  const [busy, setBusy] = useState(false)
  const title = formatMessage({
    id: 'geometryExport',
    defaultMessage: 'Geometrien exportieren',
  })
  async function download(format: GeometryFormat) {
    setBusy(true)
    try {
      const labels = Object.fromEntries(
        projectTypeOptions.map((o) => [
          o.value,
          formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
        ]),
      )
      const blob = await exportOwnGeometries(db, table, rowIds, format, labels)
      if (blob) saveAs(blob, `${table}.${format}`)
      else
        notify({
          intent: 'info',
          body: formatMessage({
            id: 'geometryExportEmpty',
            defaultMessage: 'Die Liste enthält keine Geometrien.',
          }),
        })
    } catch (error) {
      notify({
        intent: 'error',
        body: `${title}: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setBusy(false)
    }
  }
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          icon={<FaFileExport />}
          disabled={busy || !rowIds.length}
          aria-label={title}
          title={title}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {(Object.keys(formats) as GeometryFormat[]).map((format) => (
            <MenuItem
              key={format}
              onClick={() => void download(format)}
            >
              {formats[format]}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
