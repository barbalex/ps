import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { controls } from '../../styles.ts'

interface Props {
  addRow?: () => void
  nameSingular: string
  menus?: unknown[]
}

export const Menu = memo(({ addRow, nameSingular, menus }: Props) => {
  if (!addRow && !menus) return null

  return (
    <div style={controls}>
      {!!menus && menus}
      {!!addRow && (
        <Button
          size="medium"
          icon={<FaPlus />}
          onClick={addRow}
          title={`Add new ${nameSingular}`}
        />
      )}
    </div>
  )
})
