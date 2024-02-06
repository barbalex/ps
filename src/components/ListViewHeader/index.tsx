import { memo } from 'react'
import { Menu } from './Menu'

export const ListViewHeader = memo(({ title, addRow, tableName, menus }) => {
  return (
    <div className="list-view-header">
      <h1>{title}</h1>
      {!!addRow && <Menu addRow={addRow} tableName={tableName} menus={menus} />}
    </div>
  )
})
