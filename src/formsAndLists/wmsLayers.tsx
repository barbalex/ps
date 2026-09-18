import { useParams, useNavigate } from '@tanstack/react-router'

import { createWmsLayer } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWmsLayersNavData } from '../modules/useWmsLayersNavData.ts'
import '../form.css'


export const WmsLayers = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useWmsLayersNavData({projectId: projectId! })
  const { label, nameSingular } = navData
  const navs = navData.navs as { id: string; label: string | null }[]

  const add = async () => {
    const wmsLayerId = await createWmsLayer({projectId: projectId! })
    if (!wmsLayerId) return
    await navigate({
      to: `/data/projects/${projectId}/wms-layers/${wmsLayerId}/wms-layer`,
      params: { projectId, wmsLayerId },
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
          navs.map(({ id, label }) => (
            <Row key={id} to={`${id}/wms-layer`} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
