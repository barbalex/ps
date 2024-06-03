import { useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { Tab, TabList } from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { FilterHeader } from '../../../components/shared/FilterHeader.tsx'

import '../../../form.css'
import { Filter } from './Filter.tsx'

export const Component = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const filter = useMemo(
    () =>
      appState?.filter_widgets_for_fields?.or?.length > 0
        ? appState?.filter_widgets_for_fields
        : { or: [{}] },
    [appState?.filter_widgets_for_fields],
  )
  // in or filters multiple filter objects are included in filter.or
  console.log('hello widgetForField index', { filter })

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
  const isFiltered = Object.keys(filter).length > 0

  if (!appState) return <Loading />

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`Widgets For Fields Filter (${widgetsForFields.length}/${widgetsForFieldsUnfiltered.length})`}
        filterName="filter_widgets_for_fields"
        isFiltered={isFiltered}
      />
      {isFiltered && <TabList>TODO:</TabList>}
      {filter.or.map((orFilter, i) => (
        <Filter
          key={i}
          filterName="filter_widgets_for_fields"
          filter={filter}
          orIndex={i}
          appStateId={appState.app_state_id}
        />
      ))}
    </div>
  )
})
