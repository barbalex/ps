import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { controls } from '../../styles'

export const Menu = memo(({ addRow, tableName }) => {
  // console.log('render FormMenu, table: ', tableName)

  return (
    <div style={controls}>
      <Button
        size="medium"
        icon={<FaPlus />}
        onClick={addRow}
        title={`Add new ${tableName}`}
      />
    </div>
  )
})
