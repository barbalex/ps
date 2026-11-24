import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'


export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null> }) => {
  const { formatMessage } = useIntl()
  const { widgetTypeId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()

  const db = usePGlite()

  // Keep a ref to the current widgetTypeId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const widgetTypeIdRef = useRef(widgetTypeId)
  useEffect(() => {
    widgetTypeIdRef.current = widgetTypeId
  }, [widgetTypeId])

  const addRow = async () => {
    const widgetTypeId = await createWidgetType()
    navigate({ to: `../${widgetTypeId}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'widget_types',
      rowIdName: 'widget_type_id',
      rowId: widgetTypeId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT widget_type_id FROM widget_types order by label`,
      )
      const rows = res?.rows as { widget_type_id: string }[]
      const len = rows.length
      const index = rows.findIndex((p) => p.widget_type_id === widgetTypeIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `/data/widget-types/${next.widget_type_id}`,
        params: (prev) => ({ ...prev, widgetTypeId: next.widget_type_id }),
      })
    } catch (error) {
      console.error('Error navigating to next widget type:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT widget_type_id FROM widget_types order by label`,
      )
      const rows = res?.rows as { widget_type_id: string }[]
      const len = rows.length
      const index = rows.findIndex((p) => p.widget_type_id === widgetTypeIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `/data/widget-types/${previous.widget_type_id}`,
        params: (prev) => ({ ...prev, widgetTypeId: previous.widget_type_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous widget type:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: '9oUdHT', defaultMessage: 'Widget-Typ' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="widget type"
    />
  )
}
