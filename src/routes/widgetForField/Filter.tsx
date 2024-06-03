import { useCallback, useState, useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { FilterHeader } from '../../components/shared/FilterHeader.tsx'
import { Filter } from '../../components/shared/Filter.tsx'

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
  const filter = appState?.filter_widgets_for_fields

  const [fields, setFields] = useState([])
  useEffect(() => {
    db.rawQuery({ sql: `PRAGMA table_info(widgets_for_fields)` }).then(
      (fields) => {
        setFields(fields)
      },
    )
  }, [db])

  const onChange: InputProps['onChange'] = useCallback((e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // TODO: update app_state[filter_field] instead
  }, [])

  if (!appState) return <Loading />

  console.log('hello widgets for fields filter', { fields })

  return (
    <div className="form-outer-container">
      {/* TODO: need filter header */}
      <FilterHeader title="Widgets For Fields Filter" />
      {/* TODO: make filtering obvious */}
      <div className="form-container">
        {/* TODO: enable or filtering? */}
        <Filter table="widgets_for_fields" />
      </div>
    </div>
  )
}
