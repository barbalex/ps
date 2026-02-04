import { useParams } from '@tanstack/react-router'

import { useListNavData } from '../../modules/useListNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const ListList = ({ from }) => {
  const { projectId, listId } = useParams({ from })
  const { loading, navData } = useListNavData({ projectId, listId })
  const { navs, label, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="List"
        id={listId}
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
              label={nav.label ?? nav.id}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
