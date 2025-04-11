import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useSubprojectNavData } from '../../modules/useSubprojectNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const SubprojectList = memo(({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const { loading, navData } = useSubprojectNavData({
    projectId,
    subprojectId,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Subproject"
        id={subprojectId}
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
})
