import { memo, useCallback } from 'react'
import { MdEditOff } from 'react-icons/md'
import { Button } from '@fluentui/react-components'
import { useSearchParams } from 'react-router-dom'

import { FieldForm } from '../../routes/field/Form'
import { Fields as Field } from '../../generated/client'

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

type Props = {
  field: Field
}

export const FieldFormInForm = memo(({ field }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const onClickStopEditing = useCallback(async () => {
    searchParams.delete('editingField')
    setSearchParams(searchParams)
  }, [searchParams, setSearchParams])

  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <h2 style={titleStyle}>{`Editing Field ${
          field.field_label ?? field.name ?? ''
        }`}</h2>
        <Button
          size="medium"
          icon={<MdEditOff />}
          title="Stop editing"
          onClick={onClickStopEditing}
        />
      </div>
      <FieldForm field_id={field.field_id} isInForm={true} />
    </div>
  )
})
