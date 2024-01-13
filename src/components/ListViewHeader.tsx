import { memo } from 'react'
import { ListViewMenu } from './ListViewMenu'

export const ListViewHeader = memo(({ title, addRow, tableName }) => {
  return (
    <div className="list-view-header">
      <h1>{title}</h1>
      <ListViewMenu addRow={addRow} tableName={tableName} />
    </div>
  )
})
