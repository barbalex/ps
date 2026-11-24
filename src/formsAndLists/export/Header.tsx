import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createExport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdMenuBook } from 'react-icons/md'

const { Button } = fluentUiReactComponents

export const Header = ({
  autoFocusRef,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}) => {
  const { formatMessage } = useIntl()
  const { exportsId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()

  const db = usePGlite()

  const exportsIdRef = useRef(exportsId)
  useEffect(() => {
    exportsIdRef.current = exportsId
  }, [exportsId])

  const basePath = `/data/exports/${exportsId}`

  const addRow = async () => {
    const id = await createExport()
    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'exports',
      rowIdName: 'exports_id',
      rowId: exportsId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT exports_id FROM exports ORDER BY COALESCE(NULLIF(name_de, ''), exports_id::text)`,
      )
      const rows = res?.rows as { exports_id: string }[]
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
      const rows = res?.rows as { exports_id: string }[]
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
      siblings={
        <>
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={basePath}
            historyTable="exports_history"
            rowIdField="exports_id"
            rowId={exportsId}
          />
          <Button
            icon={<MdMenuBook />}
            title={formatMessage({
              id: 'exports.openDocs',
              defaultMessage: 'Dokumentation öffnen',
            })}
            onClick={() =>
              window.open('/docs/exports', '_blank', 'noreferrer')
            }
          />
        </>
      }
    />
  )
}
