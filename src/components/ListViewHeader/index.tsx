import { memo } from 'react'
import { Menu } from './Menu'

export const ListViewHeader = memo(({ title, addRow, tableName, menus }) => (
  <div className="list-view-header">
    <h1>{title}</h1>
    <Menu addRow={addRow} tableName={tableName} menus={menus} />
  </div>
))
