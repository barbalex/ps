import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePlacesNavData } from '../modules/usePlacesNavData.ts'

import '../form.css'

export const Places = memo(({ from }) => {
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId } = useParams({ from })
  const db = usePGlite()

  const { loading, navData, isFiltered } = usePlacesNavData({
    projectId,
    subprojectId,
    placeId,
  })
  const { navs, label, nameSingular, namePlural } = navData

  const add = useCallback(async () => {
    const res = await createPlace({
      db,
      projectId,
      subprojectId,
      parentId: placeId ?? null,
      level: placeId ? 2 : 1,
    })
    const place = res?.rows?.[0]
    if (!place) return
    // need to create a corresponding vector layer and vector layer display
    // TODO:
    // 1. only if not yet exists
    // 2. better via trigger so it also works on import / project creation
    const resVL = await createVectorLayer({
      projectId,
      type: 'own',
      ownTable: 'places',
      ownTableLevel: placeId ? 2 : 1,
      label: namePlural,
      db,
    })
    const newVectorLayer = resVL?.rows?.[0]

    createVectorLayerDisplay({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    createLayerPresentation({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    navigate({
      to: place.place_id,
      params: (prev) => ({ ...prev, placeId: place.place_id }),
    })
  }, [db, navigate, namePlural, placeId, projectId, subprojectId])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="places"
              level={placeId ? 2 : 1}
              placeNamePlural={namePlural}
              from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
