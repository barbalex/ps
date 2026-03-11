import { MdEditOff } from 'react-icons/md'
import { FaMinus } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  MenuGroupHeader,
} = fluentUiReactComponents
import { usePGlite } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { FieldFormFetchingOwnData } from '../../formsAndLists/field/FormFetchingOwnData.tsx'
import { addOperationAtom } from '../../store.ts'
import styles from './FieldFormInForm.module.css'

export const FieldFormInForm = ({ field }) => {
  const navigate = useNavigate()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

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
        <h2 className={styles.title}>{`${formatMessage({ id: '72yYP5', defaultMessage: 'Feld bearbeiten' })}${fieldLabel ? ` '${fieldLabel}'` : ''}`}</h2>
        <div className={styles.menu}>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button size="medium" icon={<FaMinus />} title={formatMessage({ id: 'Zv6sNt', defaultMessage: 'löschen' })} />
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                <MenuGroupHeader>{formatMessage({ id: 'Au7tOu', defaultMessage: 'Löschen?' })}</MenuGroupHeader>
                <MenuItem onClick={onClickDelete}>{formatMessage({ id: 'Bv8uPv', defaultMessage: 'Ja' })}</MenuItem>
                <MenuItem>{formatMessage({ id: 'Cw9vQw', defaultMessage: 'Nein' })}</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Button
            size="medium"
            icon={<MdEditOff />}
            title={formatMessage({ id: 'd9gLtS', defaultMessage: 'Bearbeitung beenden' })}
            onClick={onClickStopEditing}
          />
        </div>
      </div>
      <FieldFormFetchingOwnData fieldId={field.field_id} isInForm={true} />
    </div>
  )
}
