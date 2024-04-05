import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { createField } from '../../../modules/createRows'
import { user_id } from '../../SqlInitializer'
import { accountTables } from '../../../routes/field/Form'

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
export const AddField = memo(({ tableName, level }) => {
  const { project_id } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.app_state.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing

  const addRow = useCallback(async () => {
    const isAccountTable = accountTables.includes(tableName)
    const newFieldParams = { table_name: tableName, level }
    if (!isAccountTable) newFieldParams.project_id = project_id
    const newField = createField(newFieldParams)
    await db.fields.create({ data: newField })
    setSearchParams({ editingField: newField.field_id })
  }, [db.fields, level, project_id, setSearchParams, tableName])

  if (!designing) return null

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
})
