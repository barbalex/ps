import { useParams } from '@tanstack/react-router'

import { useVectorLayerNavData } from '../../modules/useVectorLayerNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const VectorLayerList = ({ from }) => {
  const { projectId, vectorLayerId } = useParams({ from })
  const { loading, navData } = useVectorLayerNavData({
    projectId,
    vectorLayerId,
  })
  const { navs, label, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Vector Layer"
        id={vectorLayerId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header
        from={from}
        row={{ label, vector_layer_id: vectorLayerId }}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((nav) => (
              <Row
                key={nav.id}
                label={nav.label}
                to={nav.id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
