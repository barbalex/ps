import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { UiOptions as UiOption } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { user_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const row: UiOption = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.ui_options.update({
        where: { user_id },
        data: { [name]: value },
      })
    },
    [db.ui_options, user_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" tableName="options" />
      <div className="form-container">
        <TextFieldInactive label="ID" name="user_id" value={row.user_id} />
        <SwitchField
          label="Breadcrumbs overflowing"
          name="breadcrumbs_overflowing"
          value={row.breadcrumbs_overflowing ?? false}
          onChange={onChange}
          validationMessage="If true, breadcrumbs will only use a single line. When they overflow, the overflowing breadcrumbs will be collected in a menu on the left."
          autoFocus
        />
        <SwitchField
          label="Navs overflowing"
          name="navs_overflowing"
          value={row.navs_overflowing ?? false}
          onChange={onChange}
          validationMessage="If true, navs will only use a single line. When they overflow, the overflowing navs will be collected in a menu on the left."
        />
      </div>
    </div>
  )
}
