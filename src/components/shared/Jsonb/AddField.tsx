import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'

import { createField } from '../../../modules/createRows.ts'
import { accountTables } from '../../../formsAndLists/field/accountTables.ts'
import { designingAtom } from '../../../store.ts'

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
export const AddField = memo(({ tableName, level, from }) => {
  const [designing] = useAtom(designingAtom)
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const isAccountTable = accountTables.includes(tableName)
    const newFieldParams = { table_name: tableName, level, db }
    if (!isAccountTable) newFieldParams.project_id = projectId
    const res = await createField(newFieldParams)
    const newField = res?.rows?.[0]
    // TODO:
    navigate({ search: { editingField: newField.field_id } })
  }, [db, level, navigate, projectId, tableName])

  if (!designing) return null
  // do not show the button on the filter page
  if (location.pathname.endsWith('/filter')) return null

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
