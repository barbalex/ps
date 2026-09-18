import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { useVectorLayerNavData } from '../../modules/useVectorLayerNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type VectorLayers from '../../models/public/VectorLayers.ts'

export const VectorLayerList = ({ from }: { from: string }) => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const { formatMessage } = useIntl()
  const { loading, navData } = useVectorLayerNavData({
    projectId: projectId!,    vectorLayerId: vectorLayerId!,  })
  const { navs, label, name, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table={formatMessage({ id: 'fN0sZQ', defaultMessage: 'Vektor-Ebene' })}
        id={vectorLayerId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header
        from={from}
        row={
          { label, name, vector_layer_id: vectorLayerId } as unknown as VectorLayers
        }
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              label={nav.label}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
