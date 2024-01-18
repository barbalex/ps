import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus, FaMinus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'

import { controls } from '../../styles'

export const FormMenu = memo(
  ({ addRow, deleteRow, toNext, toPrevious, tableName }) => (
    <div style={controls}>
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
        <Button
          size="medium"
          icon={<FaMinus />}
          onClick={deleteRow}
          title={`Delete ${tableName}`}
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
    </div>
  ),
)
