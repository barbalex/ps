import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useListNavData } from '../../modules/useListNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const ListList = memo(({ from }) => {
  const { projectId, listId } = useParams({ from })
  const { loading, navData } = useListNavData({ projectId, listId })
  const { navs, label } = navData

  return (
    <div className="list-view">
      <Header
        from={from}
        label={label}
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
})
