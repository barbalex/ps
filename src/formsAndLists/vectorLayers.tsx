import { useParams, useNavigate } from '@tanstack/react-router'

import { createVectorLayer } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useVectorLayersNavData } from '../modules/useVectorLayersNavData.ts'
import '../form.css'


export const VectorLayers = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useVectorLayersNavData({ projectId: projectId! })
  const { label, nameSingular } = navData
  const navs = navData.navs as unknown as { id: string; label: string | null }[]

  const add = async () => {
    const vectorLayerId = await createVectorLayer({
      projectId: projectId!,      type: 'wfs',
    })
    if (!vectorLayerId) return
    navigate({
      to: `/data/projects/${projectId}/vector-layers/${vectorLayerId}/vector-layer`,
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
