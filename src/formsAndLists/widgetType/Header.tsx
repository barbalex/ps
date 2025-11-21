import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/widget-types/$widgetTypeId'

export const Header = ({ autoFocusRef }) => {
  const { widgetTypeId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = createWidgetType({ db })
    const data = res?.rows?.[0]
    navigate({ to: `../${data.widget_type_id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    const sql = `DELETE FROM widget_types WHERE widget_type_id = $1`
    db.query(sql, [widgetTypeId])
    navigate({ to: `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT widget_type_id FROM widget_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.widget_type_id === widgetTypeId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/widget-types/${next.widget_type_id}`,
      params: (prev) => ({ ...prev, widgetTypeId: next.widget_type_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT widget_type_id FROM widget_types order by label`,
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.widget_type_id === widgetTypeId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/widget-types/${previous.widget_type_id}`,
      params: (prev) => ({ ...prev, widgetTypeId: previous.widget_type_id }),
    })
  }

  return (
    <FormHeader
      title="Widget type"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="widget type"
    />
  )
}
