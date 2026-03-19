import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { languageAtom } from '../../store.ts'
import { usePlaceNavData } from '../../modules/usePlaceNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const PlaceList = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const [language] = useAtom(languageAtom)
  const { loading, navData } = usePlaceNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, notFound, nameSingular } = navData

  const nameRes = useLiveQuery(
    `SELECT name_singular_${language}, name_plural_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const nameSingularFromLevel =
    nameRes?.rows?.[0]?.[`name_singular_${language}`] ?? nameSingular
  const namePlural = nameRes?.rows?.[0]?.[`name_plural_${language}`] ?? 'Places'

  if (notFound) {
    return (
      <NotFound
        table={nameSingularFromLevel}
        id={placeId2 ?? placeId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header
        from={from}
        nameSingular={nameSingularFromLevel}
        namePlural={namePlural}
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
