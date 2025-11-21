import { useParams } from '@tanstack/react-router'

import { usePlaceNavData } from '../../modules/usePlaceNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const PlaceList = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const { loading, navData } = usePlaceNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, notFound, nameSingular } = navData

  if (notFound) {
    return (
      <NotFound
        table={nameSingular}
        id={placeId2 ?? placeId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header from={from} />
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
