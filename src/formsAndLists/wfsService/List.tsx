import { useParams } from '@tanstack/react-router'

import { useWfsServiceNavData } from '../../modules/useWfsServiceNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const WfsServiceList = ({ from }) => {
  const { projectId, wfsServiceId } = useParams({ from })
  const { loading, navData } = useWfsServiceNavData({ projectId, wfsServiceId })
  const { navs, label, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="WFS Service"
        id={wfsServiceId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header
        from={from}
        label={label}
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
