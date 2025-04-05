import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useActionNavData } from '../../modules/useActionNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const ActionList = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId } = useParams({
    from,
  })
  const { loading, navData } = useActionNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
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
