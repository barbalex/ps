import { memo } from 'react'
import { FaPlus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { Delete } from './Delete.tsx'
import { MenuBar } from '../../MenuBar/index.tsx'
import { controls } from '../../../styles.ts'

export const FormMenu = memo(
  ({ addRow, deleteRow, toNext, toPrevious, tableName, siblings }) => (
    <MenuBar>
      {!!siblings && siblings}
      {!!toPrevious && (
        <Button
          size="medium"
          icon={<FaChevronLeft />}
          onClick={toPrevious}
          title={`Previous ${tableName}`}
        />
      )}
      {!!addRow && (
        <Button
          size="medium"
          icon={<FaPlus />}
          onClick={addRow}
          title={`New ${tableName}`}
        />
      )}
      {!!deleteRow && (
        <Delete
          deleteRow={deleteRow}
          tableName={tableName}
        />
      )}
      {!!toNext && (
        <Button
          size="medium"
          icon={<FaChevronRight />}
          onClick={toNext}
          title={`Next ${tableName}`}
        />
      )}
    </MenuBar>
  ),
)
