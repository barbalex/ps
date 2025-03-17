import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useAtom } from 'jotai'
import {
  usePGlite,
  useLiveIncrementalQuery,
  useLiveQuery,
} from '@electric-sql/pglite-react'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { places1FilterAtom, places2FilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id, subproject_id, place_id } = useParams()
  const db = usePGlite()

  const [places1Filter] = useAtom(places1FilterAtom)
  const [places2Filter] = useAtom(places2FilterAtom)
  const filter = place_id ? places2Filter : places1Filter

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const sql = `
    SELECT 
      place_id, 
      label 
    FROM places 
    WHERE 
      parent_id ${place_id ? `= '${place_id}'` : `IS NULL`} 
      AND subproject_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`
  const params = [subproject_id]
  const res = useLiveIncrementalQuery(sql, params, 'place_id')
  const isLoading = res === undefined
  const places = res?.rows ?? []

  // TODO: get names in above query by joining with place_levels
  // to save a render
  const resultPlaceLevel = useLiveQuery(
    `
    SELECT 
      name_singular, 
      name_plural 
    FROM place_levels 
    WHERE 
      project_id = $1 
      AND level = $2 
    ORDER BY label`,
    [project_id, place_id ? 2 : 1],
  )
  const placeLevel = resultPlaceLevel?.rows?.[0]
  const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

  const add = useCallback(async () => {
    const res = await createPlace({
      db,
      project_id,
      subproject_id,
      parent_id: place_id ?? null,
      level: place_id ? 2 : 1,
    })
    const place = res?.rows?.[0]
    if (!place) return
    // need to create a corresponding vector layer and vector layer display
    // TODO:
    // 1. only if not yet exists
    // 2. better via trigger so it also works on import / project creation
    const resVL = await createVectorLayer({
      project_id,
      type: 'own',
      own_table: 'places',
      own_table_level: place_id ? 2 : 1,
      label: placeNamePlural,
      db,
    })
    const newVectorLayer = resVL?.rows?.[0]

    await createVectorLayerDisplay({
      vector_layer_id: newVectorLayer.vector_layer_id,
      db,
    })

    await createLayerPresentation({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    navigate({ pathname: place.place_id, search: searchParams.toString() })
  }, [
    db,
    navigate,
    placeNamePlural,
    place_id,
    project_id,
    searchParams,
    subproject_id,
  ])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural={placeNamePlural}
        nameSingular={placeNameSingular}
        tableName="places"
        countFiltered={places.length}
        isLoading={isLoading}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="places"
              level={place_id ? 2 : 1}
              placeNamePlural={placeNamePlural}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {places.map(({ place_id, label }) => (
              <Row
                key={place_id}
                to={place_id}
                label={label ?? place_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
