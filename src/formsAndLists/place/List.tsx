import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { usePlaceNavData } from '../../modules/usePlaceNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const PlaceList = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const { loading, navData } = usePlaceNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs } = navData

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
})
