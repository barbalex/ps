import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id, subproject_id, place_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const filterField = place_id ? 'filter_places_2' : 'filter_places_1'

  const filter = useMemo(
    () =>
      appState?.[filterField]?.filter?.((f) => Object.keys(f).length > 0) ?? [],
    [appState, filterField],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: places = [] } = useLiveQuery(
    db.places.liveMany({
      where: { parent_id: place_id ?? null, subproject_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: placesUnfiltered = [] } = useLiveQuery(
    db.places.liveMany({
      where: { parent_id: place_id ?? null, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = places.length !== placesUnfiltered.length

  const { results: placeLevel } = useLiveQuery(
    db.place_levels.liveFirst({
      where: {
        project_id,
        level: place_id ? 2 : 1,
      },
      orderBy: { label: 'asc' },
    }),
  )
  const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

  const add = useCallback(async () => {
    const data = await createPlace({
      db,
      project_id,
      subproject_id,
      parent_id: place_id ?? null,
      level: place_id ? 2 : 1,
    })
    await db.places.create({ data })
    // need to create a corresponding vector layer and vector layer display
    // TODO:
    // 1. only of not yet exists
    // 2. better via trigger so it also works on import / project creation
    const vectorLayer = createVectorLayer({
      project_id,
      type: place_id ? 'places2' : 'places1',
      label: placeNamePlural,
    })
    const newVectorLayer = await db.vector_layers.create({ data: vectorLayer })
    const newVLD = createVectorLayerDisplay({
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    db.vector_layer_displays.create({ data: newVLD })
    const newLP = createLayerPresentation({
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    db.layer_presentations.create({ data: newLP })
    navigate({ pathname: data.place_id, search: searchParams.toString() })
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
        title={`${placeNamePlural} (${
          isFiltered
            ? `${places.length}/${placesUnfiltered.length}`
            : places.length
        })`}
        addRow={add}
        tableName={placeNameSingular}
        menus={
          <>
            <LayerMenu
              table="places"
              level={place_id ? 2 : 1}
              placeNamePlural={placeNamePlural}
            />
            <FilterButton table="places" filterField={filterField} />
          </>
        }
      />
      <div className="list-container">
        {places.map(({ place_id, label }) => (
          <Row key={place_id} to={place_id} label={label ?? place_id} />
        ))}
      </div>
    </div>
  )
})
