import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { FaPlus } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { createField } from '../../../modules/createRows.ts'
import { accountTables } from '../../../formsAndLists/field/accountTables.ts'
import { designingAtom } from '../../../store.ts'
import styles from './AddField.module.css'

// idea:
// 1. A button to add fields
// 2. On Click, add a new field
// 3. ...and immediately enter field editing modus
// 4. which is:
//    - a title and the necessary part of the field form
//    - a search param in the url: editingField=fieldId
type Props = {
  tableName: string
  level?: number
  from?: string
}

export const AddField = ({ tableName, level }: Props) => {
  const [designing] = useAtom(designingAtom)
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const location = useLocation()
  const { formatMessage } = useIntl()
  const addFieldLabel = formatMessage({
    id: 'lWQzTz',
    defaultMessage: 'Feld hinzufügen',
  })

  const addRow = async () => {
    const isAccountTable = accountTables.includes(tableName)
    const newFieldParams: Parameters<typeof createField>[0] = {
      table_name: tableName,
      level,
    }
    if (!isAccountTable) newFieldParams.projectId = projectId
    const id = await createField(newFieldParams)
    // TODO:
    navigate({ search: { editingField: id } as never })
  }

  if (!designing) return null
  // do not show the button on the filter page
  if (location.pathname.endsWith('/filter')) return null

  return (
    <Button
      size="medium"
      icon={<FaPlus />}
      onClick={addRow}
      title={addFieldLabel}
      className={styles.button}
    >
      {addFieldLabel}
    </Button>
  )
}
