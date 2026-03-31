import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { FaPlus } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { createField } from '../../../modules/createRows.ts'
import { designingAtom } from '../../../store.ts'
import styles from './AddField.module.css'

// idea:
// 1. A button to add fields
// 2. On Click, add a new field
// 3. ...and immediately enter field editing modus
// 4. which is:
//    - a title and the necessary part of the field form
//    - a search param in the url: editingField=fieldId
export const AddField = ({ tableName, level, from }) => {
  const [designing] = useAtom(designingAtom)
  const navigate = useNavigate()
  const location = useLocation()
  const { formatMessage } = useIntl()

  const addRow = async () => {
    const newFieldParams = { table_name: tableName, level }
    const id = await createField(newFieldParams)
    // TODO:
    navigate({ search: { editingField: id } })
  }

  if (!designing) return null
  // do not show the button on the filter page
  if (location.pathname.endsWith('/filter')) return null

  return (
    <Button
      size="medium"
      icon={<FaPlus />}
      onClick={addRow}
      title={formatMessage({ id: 'lWQzTz', defaultMessage: 'Feld hinzufügen' })}
      className={styles.button}
    >
      {formatMessage({ id: 'lWQzTz', defaultMessage: 'Feld hinzufügen' })}
    </Button>
  )
}
