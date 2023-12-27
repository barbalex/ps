import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

export const ListViewMenu = memo(({ addRow, tableName }) => {
  // console.log('render FormMenu, table: ', tableName)

  return (
    <div className="controls">
      <Button
        size="medium"
        icon={<FaPlus />}
        onClick={addRow}
        title={`Add new ${tableName}`}
      />
    </div>
  )
})
