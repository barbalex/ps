import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useTaxonomyNavData } from '../../modules/useTaxonomyNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const TaxonomyList = memo(({ from }) => {
  const { projectId, taxonomyId } = useParams({ from })
  const { loading, navData } = useTaxonomyNavData({ projectId, taxonomyId })
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
