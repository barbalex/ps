import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createExport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/exports/$exportsId'

export const Header = ({ autoFocusRef }) => {
  const { formatMessage } = useIntl()
  const { exportsId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const exportsIdRef = useRef(exportsId)
  useEffect(() => {
    exportsIdRef.current = exportsId
  }, [exportsId])

  const addRow = async () => {
    const id = await createExport()
    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM exports WHERE exports_id = $1`, [exportsId])
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM exports WHERE exports_id = $1`, [exportsId])
      addOperation({
        table: 'exports',
        rowIdName: 'exports_id',
        rowId: exportsId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting export:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT exports_id FROM exports ORDER BY COALESCE(NULLIF(name_de, ''), exports_id::text)`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.exports_id === exportsIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `/data/exports/${next.exports_id}`,
        params: (prev) => ({ ...prev, exportsId: next.exports_id }),
      })
    } catch (error) {
      console.error('Error navigating to next export:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT exports_id FROM exports ORDER BY COALESCE(NULLIF(name_de, ''), exports_id::text)`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.exports_id === exportsIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `/data/exports/${previous.exports_id}`,
        params: (prev) => ({ ...prev, exportsId: previous.exports_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous export:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'exports.nameSingular',
        defaultMessage: 'Export',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="export"
    />
  )
}
