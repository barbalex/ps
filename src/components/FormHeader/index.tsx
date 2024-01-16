import { memo } from 'react'
import { FormMenu } from './FormMenu'

export const FormHeader = memo(
  ({ title, addRow, deleteRow, toNext, toPrevious, tableName }) => {
    return (
      <div className="form-header">
        <h1>{title}</h1>
        {(addRow || deleteRow || toNext || toPrevious) && (
          <FormMenu
            addRow={addRow}
            deleteRow={deleteRow}
            toNext={toNext}
            toPrevious={toPrevious}
            tableName={tableName}
          />
        )}
      </div>
    )
  },
)
