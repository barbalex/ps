import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useVectorLayersNavData } from '../modules/useVectorLayersNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/vector-layers/'

export const VectorLayers = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useVectorLayersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const data = await createVectorLayer({
      projectId,
      type: 'wfs',
    })
    if (!data) return
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vectorLayerId: data.vector_layer_id,
      db,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vectorLayerId: data.vector_layer_id,
      db,
    })
    navigate({
      to: data.vector_layer_id,
      params: (prev) => ({ ...prev, vectorLayerId: data.vector_layer_id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ id, label }) => (
              <Row key={id} to={id} label={label ?? id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
