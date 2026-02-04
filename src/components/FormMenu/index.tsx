import { FaPlus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { Button, Tooltip } from '@fluentui/react-components'

import { Delete } from './Delete.tsx'
import { MenuBar } from '../MenuBar/index.tsx'

export const FormMenu = ({
  addRow,
  deleteRow,
  toNext,
  toPrevious,
  toNextDisabled = false,
  toPreviousDisabled = false,
  tableName = '',
  siblings,
}) => (
  <MenuBar>
    {!!siblings && siblings}
    {!!toPrevious && (
      <Tooltip content={`Previous ${tableName}`}>
        <Button
          size="medium"
          icon={<FaChevronLeft />}
          onClick={toPrevious}
          disabled={toPreviousDisabled}
        />
      </Tooltip>
    )}
    {!!addRow && (
      <Tooltip content={`New ${tableName}`}>
        <Button
          size="medium"
          icon={<FaPlus />}
          onClick={addRow}
        />
      </Tooltip>
    )}
    {!!deleteRow && (
      <Delete
        deleteRow={deleteRow}
        tableName={tableName}
      />
    )}
    {!!toNext && (
      <Tooltip content={`Next ${tableName}`}>
        <Button
          size="medium"
          icon={<FaChevronRight />}
          onClick={toNext}
          disabled={toNextDisabled}
        />
      </Tooltip>
    )}
  </MenuBar>
)
