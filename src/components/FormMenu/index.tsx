import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus, FaMinus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'

export const FormMenu = memo(
  ({ addRow, deleteRow, toNext, toPrevious, tableName }) => {
    console.log('FormMenu ', {
      tableName,
      addRow,
      deleteRow,
      toNext,
      toPrevious,
    })

    return (
      <div className="controls">
        {toPrevious && (
          <Button
            size="medium"
            icon={<FaChevronLeft />}
            onClick={toPrevious}
            title={`Previous ${tableName}`}
          />
        )}
        <Button
          size="medium"
          icon={<FaPlus />}
          onClick={addRow}
          title={`New ${tableName}`}
        />
        <Button
          size="medium"
          icon={<FaMinus />}
          onClick={deleteRow}
          title={`Delete ${tableName}`}
        />
        {toNext && (
          <Button
            size="medium"
            icon={<FaChevronRight />}
            onClick={toNext}
            title={`Next ${tableName}`}
          />
        )}
      </div>
    )
  },
)
