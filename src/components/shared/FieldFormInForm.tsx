import { MdEditOff } from 'react-icons/md'
import { FaMinus } from 'react-icons/fa'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  MenuGroupHeader,
} from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { FieldFormFetchingOwnData } from '../../formsAndLists/field/FormFetchingOwnData.tsx'
import { addOperationAtom } from '../../store.ts'
import styles from './FieldFormInForm.module.css'

export const FieldFormInForm = ({ field }) => {
  const navigate = useNavigate()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const onClickDelete = () => {
    db.query(`DELETE FROM fields WHERE field_id = $1`, [field.field_id])
    addOperation({
      table: 'fields',
      rowIdName: 'field_id',
      rowId: field.field_id,
      operation: 'delete',
      prev: { ...field },
    })
    navigate({ search: { editingField: undefined } })
  }

  const onClickStopEditing = () =>
    navigate({ search: { editingField: undefined } })

  const fieldLabel = field.field_label ?? field.name ?? ''

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{`Editing Field ${
          fieldLabel ? `'${fieldLabel}'` : ''
        }`}</h2>
        <div className={styles.menu}>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button size="medium" icon={<FaMinus />} title="Delete" />
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                <MenuGroupHeader>Delete this field?</MenuGroupHeader>
                <MenuItem onClick={onClickDelete}>Yes </MenuItem>
                <MenuItem>Noooooo!</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Button
            size="medium"
            icon={<MdEditOff />}
            title="Stop editing"
            onClick={onClickStopEditing}
          />
        </div>
      </div>
      <FieldFormFetchingOwnData fieldId={field.field_id} isInForm={true} />
    </div>
  )
}
