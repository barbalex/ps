import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus, FaMinus } from 'react-icons/fa'

export const FormMenu = memo(({ addRow, deleteRow, tableName }) => {
  // console.log('render FormMenu')
  
  return (
    <div className="controls">
      <Button
        size="large"
        icon={<FaPlus />}
        onClick={addRow}
        title={`Add new ${tableName}`}
      />
      <Button
        size="large"
        icon={<FaMinus />}
        onClick={deleteRow}
        title={`Delete ${tableName}`}
      />
    </div>
  )
})
