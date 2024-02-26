import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { controls } from '../../styles'

export const Menu = memo(({ addRow, tableName, menus }) => {
  // console.log('render FormMenu, table: ', tableName)

  if (!addRow && !menus) return null

  return (
    <div style={controls}>
      {!!menus && menus}
      {!!addRow && (
        <Button
          size="medium"
          icon={<FaPlus />}
          onClick={addRow}
          title={`Add new ${tableName}`}
        />
      )}
    </div>
  )
})
