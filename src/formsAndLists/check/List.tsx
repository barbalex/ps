import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useCheckNavData } from '../../modules/useCheckNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const CheckList = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, checkId } = useParams({
    from,
  })
  const { loading, navData } = useCheckNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
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
