import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'
import { useVectorLayerDisplaysNavData } from '../modules/useVectorLayerDisplaysNavData.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../store.ts'

import '../form.css'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/'

// this form can be used from the router or inside the left map drawer
// map drawer passes the vectorLayerId as a prop
export const VectorLayerDisplays = ({ vectorLayerId: vectorLayerIdIn }) => {
  const setVectorLayerDisplayId = useSetAtom(mapDrawerVectorLayerDisplayAtom)
  const params = useParams({ from })
  const { projectId } = params
  const vectorLayerId = vectorLayerIdIn || params.vectorLayerId
  const calledFromMapDrawer = vectorLayerIdIn !== undefined

  const navigate = useNavigate()

  const { loading, navData } = useVectorLayerDisplaysNavData({
    projectId,
    vectorLayerId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createVectorLayerDisplay({ vectorLayerId })
    if (!id) return
    if (vectorLayerId) {
      // we are in the map drawer
      setVectorLayerDisplayId(id)
      return
    }
    // we are in normal routing
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        vectorLayerDisplayId: id,
      }),
    })
  }

  const onClickRow = (id) => {
    if (vectorLayerId) {
      setVectorLayerDisplayId(id)
      return
    }
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        vectorLayerDisplayId: id,
      }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
              onClick={calledFromMapDrawer ? () => onClickRow(id) : undefined}
            />
          ))
        }
      </div>
    </div>
  )
}
