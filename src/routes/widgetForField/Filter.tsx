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

export const Component = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const filter = useMemo(
    () => appState?.filter_widgets_for_fields ?? {},
    [appState?.filter_widgets_for_fields],
  )

  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
      where: { ...(appState?.filter_widgets_for_fields ?? {}) },
    }),
  )
  const { results: widgetsForFieldsUnfiltered = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // TODO: in text fields, lowercase?
      const newFilter = { ...filter }
      if (value) {
        newFilter[name] = value
      } else {
        delete newFilter[name]
      }
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { filter_widgets_for_fields: newFilter },
      })
    },
    [appState?.app_state_id, db.app_states, filter],
  )

  if (!appState) return <Loading />

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`Widgets For Fields Filter (${widgetsForFields.length}/${widgetsForFieldsUnfiltered.length})`}
        filterName="filter_widgets_for_fields"
        filter={filter}
      />
      <div className="form-container filter">
        {/* TODO: enable or filtering */}
        <WidgetForFieldForm onChange={onChange} row={filter} />
      </div>
    </div>
  )
})
