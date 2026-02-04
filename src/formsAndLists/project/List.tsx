import { useParams } from '@tanstack/react-router'

import { useProjectNavData } from '../../modules/useProjectNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

// const from = '/data/projects/$projectId/'

export const ProjectList = ({ from }) => {
  const { projectId } = useParams({ from })
  const { loading, navData } = useProjectNavData({ projectId })
  const { navs, label, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Project"
        id={projectId}
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
