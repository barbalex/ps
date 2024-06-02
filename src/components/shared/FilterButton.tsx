import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-button'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  table: string
  level: integer
  placeNamePlural?: string
}
export const FilterButton = memo(({ table, filterField }: Props) => {
  const { user: authUser } = useCorbado()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const filter = appState?.[filterField]

  // query the data of the table using the filter
  // TODO: need to filter by parent table's id too
  const { results: filteredData } = useLiveQuery(
    db[table]?.liveMany?.({ where: filter ?? {} }),
  )
  const { results: unfilteredData } = useLiveQuery(db[table]?.liveMany?.())
  const isFiltered = filteredData?.length !== unfilteredData?.length

  const onClick = useCallback(async () => {
    // get all geometries from layer
    // first get all places with level
    // then get all actions/checks/occurrences with place_id
    navigate({
      pathname: 'filter',
      search: searchParams.toString(),
    })
  }, [navigate, searchParams])

  return (
    <Button
      size="medium"
      icon={isFiltered ? <MdFilterAltOff /> : <MdFilterAlt />}
      onClick={onClick}
      title={isFiltered ? 'Clear filter' : 'Filter'}
    />
  )
})
