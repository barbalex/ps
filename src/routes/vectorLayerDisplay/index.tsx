import { useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
// import type { InputProps } from '@fluentui/react-components'

import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
// import { TextField } from '../../components/shared/TextField'
// import { SwitchField } from '../../components/shared/SwitchField'
// import { RadioGroupField } from '../../components/shared/RadioGroupField'
// import { DropdownFieldFromLayerOptions } from '../../components/shared/DropdownFieldFromLayerOptions'
// import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { vector_layer_display_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.vector_layer_displays.liveUnique({ where: { vector_layer_display_id } }),
  )

  const row: VectorLayerDisplay = results

  console.log('hello VectorLayerDisplayForm, row:', row)

  // const onChange: InputProps['onChange'] = useCallback(
  //   (e, data) => {
  //     const { name, value } = getValueFromChange(e, data)
  //     db.vector_layer_displays.update({
  //       where: { vector_layer_display_id },
  //       data: { [name]: value },
  //     })
  //   },
  //   [db.vector_layer_displays, vector_layer_display_id],
  // )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="vector_layer_display_id"
          value={row.vector_layer_display_id}
        />
      </div>
    </div>
  )
}
