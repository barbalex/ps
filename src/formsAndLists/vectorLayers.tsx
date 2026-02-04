import { useParams, useNavigate } from '@tanstack/react-router'

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

  const { loading, navData, isFiltered } = useVectorLayersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const vectorLayerId = await createVectorLayer({
      projectId,
      type: 'wfs',
    })
    if (!vectorLayerId) return
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vectorLayerId,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vectorLayerId,
    })
    navigate({
      to: '/data/projects/$projectId_/vector-layers/$vectorLayerId/vector-layer',
      params: { projectId, vectorLayerId },
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
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
