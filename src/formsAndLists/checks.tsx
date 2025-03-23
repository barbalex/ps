import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCheck } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { checks1FilterAtom, checks2FilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

export const Checks = memo(({from}) => {
  const { projectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const [checks1Filter] = useAtom(checks1FilterAtom)
  const [checks2Filter] = useAtom(checks2FilterAtom)
  const filter = placeId2 ? checks2Filter : checks1Filter

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `SELECT 
      check_id, 
      label 
    FROM checks 
    WHERE 
      place_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [placeId2 ?? placeId],
    'check_id',
  )
  const isLoading = res === undefined
  const checks = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheck({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_id,
      params: (prev) => ({ ...prev, checkId: data.check_id }),
    })
  }, [db, navigate, placeId, placeId2, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Checks"
        nameSingular="check"
        tableName="checks"
        isFiltered={isFiltered}
        countFiltered={checks.length}
        isLoading={isLoading}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="checks"
              level={placeId2 ? 2 : 1}
              //TODO: from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {checks.map(({ check_id, label }) => (
              <Row
                key={check_id}
                label={label ?? check_id}
                to={check_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
