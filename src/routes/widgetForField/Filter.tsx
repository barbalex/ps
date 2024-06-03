import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { FilterHeader } from '../../components/shared/FilterHeader.tsx'
import { WidgetForFieldForm } from './Form.tsx'

import '../../form.css'

export const Component = () => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // TODO: load from app_state[filter_field] instead
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const filter = useMemo(
    () => appState?.filter_widgets_for_fields ?? {},
    [appState?.filter_widgets_for_fields],
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // TODO: update app_state[filter_field] instead
      console.log('hello widgets for fields filter, onChange', { name, value })
      // TODO: in text fields, lowercase?
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { filter_widgets_for_fields: { ...filter, [name]: value } },
      })
    },
    [appState?.app_state_id, db.app_states, filter],
  )

  if (!appState) return <Loading />

  console.log('hello widgets for fields filter', { filter })

  return (
    <div className="form-outer-container">
      {/* TODO: need filter header */}
      <FilterHeader title="Widgets For Fields Filter" filterName="filter_widgets_for_fields" filter={filter} />
      {/* TODO: make filtering obvious */}
      <div className="form-container">
        {/* TODO: enable or filtering? */}
        <WidgetForFieldForm onChange={onChange} row={filter} />
      </div>
    </div>
  )
}
