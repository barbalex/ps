import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { useSubprojectNavData } from '../../modules/useSubprojectNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'

export const SubprojectList = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const [language] = useAtom(languageAtom)
  const { loading, navData } = useSubprojectNavData({
    projectId,
    subprojectId,
  })
  const { navs, notFound } = navData

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const nameSingular = projectRes?.rows?.[0]?.subproject_name_singular

  if (notFound) {
    return <NotFound table="Subproject" id={subprojectId} />
  }

  return (
    <div className="list-view">
      <Header from={from} nameSingular={nameSingular} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map((nav) => <Row key={nav.id} label={nav.label} to={nav.id} />)
        )}
      </div>
    </div>
  )
}
