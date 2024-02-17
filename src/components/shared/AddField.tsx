import { useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useParams, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createField } from '../../modules/createRows'

const buttonStyle = {
  minHeight: 32,
  alignSelf: 'flex-start',
}

// idea:
// 1. A button to add fields
// 2. On Click, add a new field
// 3. ...and immediately enter field editing modus
// 4. which is:
//    - a title and the necessary part of the field form
//    - a search param in the url: editingField=fieldId
export const AddField = ({ tableName, level }) => {
  const { project_id } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const newField = createField({ project_id, table_name: tableName, level })
    await db.fields.create({ data: newField })
    setSearchParams({ editingField: newField.field_id })
  }, [db.fields, level, project_id, setSearchParams, tableName])

  return (
    <Button
      size="medium"
      icon={<FaPlus />}
      onClick={addRow}
      title="Add Field"
      style={buttonStyle}
    >
      Add Field
    </Button>
  )
}
