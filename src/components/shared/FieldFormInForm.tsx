import { memo, useCallback } from 'react'
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

import { FieldFormFetchingOwnData } from '../../formsAndLists/field/FormFetchingOwnData.tsx'

const containerStyle = {
  padding: '0px -10px',
  paddingLeft: '-10px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(103, 216, 101, 0.05)',
}

const titleRowStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '5px 10px',
  backgroundColor: 'rgba(103, 216, 101, 0.15)',
}
const titleStyle = {
  margin: 0,
  fontSize: 'medium',
  // lineHeight: 32,
}
const menuStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  columnGap: 5,
}

export const FieldFormInForm = memo(({ field, Route }) => {
  const navigate = Route.useNavigate()
  const db = usePGlite()

  const onClickDelete = useCallback(async () => {
    db.query(`DELETE FROM fields WHERE field_id = $1`, [field.field_id])
    navigate({ search: { editingField: '' } })
  }, [db, field.field_id, navigate])

  const onClickStopEditing = useCallback(async () => {
    navigate({ search: { editingField: '' } })
  }, [navigate])

  const fieldLabel = field.field_label ?? field.name ?? ''

  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <h2 style={titleStyle}>{`Editing Field ${
          fieldLabel ? `'${fieldLabel}'` : ''
        }`}</h2>
        <div style={menuStyle}>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                size="medium"
                icon={<FaMinus />}
                title="Delete"
              />
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
      <FieldFormFetchingOwnData
        field_id={field.field_id}
        isInForm={true}
      />
    </div>
  )
})
