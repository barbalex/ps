import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextArea } from '../../components/shared/TextArea'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { UploadButton } from '../../components/shared/UploadButton'
import { processData } from './processData'

import '../../form.css'

export const Component = () => {
  const { occurrence_import_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.occurrence_imports.liveUnique({ where: { occurrence_import_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.occurrence_imports.update({
        where: { occurrence_import_id },
        data: { [name]: value },
      })
    },
    [db.occurrence_imports, occurrence_import_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // TODO:
  // show stepper-like tabs on new import:
  // 1. basics/data: name, attribution, file
  // 2. geometry: mode (coordinates or geometry), field(s) and projection
  // 4. date: choose how to extract date from fields
  // 5. label: choose how to create label from fields
  // 6. identification: choose id field, previous import and how to extend it
  // 7. execute import (only visible before import)
  // - stepper titles begin with a number in a circle
  // - completed steps: circle is gren
  // - uncompleted steps: circle is grey, title is normal
  // - current step: circle is blue, title is bold
  // - the next stepper can not be accessed before the previous is completed

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="occurrence_import_id"
          value={row.occurrence_import_id}
        />
        <TextFieldInactive
          label="Created time"
          name="created_time"
          value={row.created_time}
        />
        <TextFieldInactive
          label="Inserted count"
          name="inserted_count"
          value={row.inserted_count}
          type="number"
        />
        <TextField
          label="Name"
          name="name"
          type="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextArea
          label="Attribution"
          name="attribution"
          value={row.attribution ?? ''}
          onChange={onChange}
        />
        {/* TODO: only show when not yet uploaded? */}
        <UploadButton processData={processData} />
      </div>
    </div>
  )
}
