import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createQc } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/qcs/$qcsId'

export const Header = ({ autoFocusRef }) => {
  const { formatMessage } = useIntl()
  const { qcsId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const qcsIdRef = useRef(qcsId)
  useEffect(() => {
    qcsIdRef.current = qcsId
  }, [qcsId])

  const addRow = async () => {
    const id = await createQc()
    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM qcs WHERE qcs_id = $1`, [
        qcsId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM qcs WHERE qcs_id = $1`, [qcsId])
      addOperation({
        table: 'qcs',
        rowIdName: 'qcs_id',
        rowId: qcsId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting qc:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT qcs_id FROM qcs ORDER BY COALESCE(NULLIF(name_de, ''), qcs_id::text)`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.qcs_id === qcsIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `/data/qcs/${next.qcs_id}`,
        params: (prev) => ({ ...prev, qcsId: next.qcs_id }),
      })
    } catch (error) {
      console.error('Error navigating to next qc:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT qcs_id FROM qcs ORDER BY COALESCE(NULLIF(name_de, ''), qcs_id::text)`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.qcs_id === qcsIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `/data/qcs/${previous.qcs_id}`,
        params: (prev) => ({ ...prev, qcsId: previous.qcs_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous qc:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'qcs.nameSingular',
        defaultMessage: 'Qualitätskontrolle',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="qc"
    />
  )
}
