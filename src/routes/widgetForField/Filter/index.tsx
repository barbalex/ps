import { useMemo, memo, useState, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { Tab, TabList } from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { FilterHeader } from '../../../components/shared/FilterHeader.tsx'

import '../../../form.css'
import { Filter } from './Filter.tsx'

const tabStyle = {
  minWidth: 60,
}

export const Component = memo(() => {
  const { user: authUser } = useCorbado()

  const [activeTab, setActiveTab] = useState(1)
  const onTabSelect = useCallback((e, data) => setActiveTab(data.value), [])

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const filter = useMemo(
    () =>
      appState?.filter_widgets_for_fields?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_widgets_for_fields],
  )

  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const isFiltered = filter.length > 0
  const orFiltersToUse = isFiltered ? [...filter, {}] : [{}]

  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
      where,
    }),
  )
  const { results: widgetsForFieldsUnfiltered = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  if (!appState) return <Loading />

  return (
    <div className="form-outer-container">
      <FilterHeader
        title={`Widgets For Fields Filter (${widgetsForFields.length}/${widgetsForFieldsUnfiltered.length})`}
        filterName="filter_widgets_for_fields"
        isFiltered={isFiltered}
      />
      <TabList selectedValue={activeTab} onTabSelect={onTabSelect}>
        {orFiltersToUse.map((f, i) => (
          <Tab key={i} value={i + 1} style={tabStyle}>
            {i + 1}
          </Tab>
        ))}
      </TabList>
      <Filter
        filterName="filter_widgets_for_fields"
        orFilters={orFiltersToUse}
        orIndex={activeTab - 1}
        appStateId={appState.app_state_id}
      />
    </div>
  )
})
