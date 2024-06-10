import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../ElectricProvider.tsx'
import { SwitchField } from '../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../modules/getValueFromChange.ts'
import { FormHeader } from '../components/FormHeader/index.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Component = memo(() => {
  const { app_state_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.app_states.liveUnique({ where: { app_state_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.app_states.update({
        where: { app_state_id },
        data: { [name]: value },
      })
    },
    [app_state_id, db.app_states],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" />
      <div className="form-container">
        <SwitchField
          label="Breadcrumbs overflowing"
          name="breadcrumbs_overflowing"
          value={row.breadcrumbs_overflowing ?? false}
          onChange={onChange}
          validationMessage="If true, breadcrumbs will only use a single line. When they overflow, the overflowing breadcrumbs will be collected in a menu on the left"
          autoFocus
        />
        <SwitchField
          label="Navs overflowing"
          name="navs_overflowing"
          value={row.navs_overflowing ?? false}
          onChange={onChange}
          validationMessage="If true, navs will only use a single line. When they overflow, the overflowing navs will be collected in a menu on the left"
        />
      </div>
    </div>
  )
})
