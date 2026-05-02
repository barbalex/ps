import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { createProjectQc } from '../modules/createRows.ts'
import { useProjectQcsNavData } from '../modules/useProjectQcsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { languageAtom } from '../store.ts'
import { subprojectNameSingularExpr } from '../modules/subprojectNameCols.ts'

import '../form.css'

const from = '/data/projects/$projectId_/qcs/'

export const ProjectQcs = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const [language] = useAtom(languageAtom)
  const { formatMessage } = useIntl()

  const { loading, navData } = useProjectQcsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular
     FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const subprojectNameSingular: string =
    (projectRes?.rows?.[0]?.subproject_name_singular as string | undefined) ??
    formatMessage({ id: 'subproject', defaultMessage: 'Teilprojekt' })

  const description = formatMessage(
    {
      id: 'projectQcs.description',
      defaultMessage:
        'Hier kannst du eigene Qualitätskontrollen erstellen. Sie sind in diesem Projekt verfügbar. Sie können auf Ebene Projekt oder {subprojectName} angewendet werden.',
    },
    { subprojectName: subprojectNameSingular },
  )

  const add = async () => {
    const id = await createProjectQc({ projectId })
    if (!id) return
    navigate({ to: `${id}/` })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        description={description}
        addRow={add}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map((nav) => (
            <Row key={nav.id} to={`${nav.id}/`} label={nav.label ?? nav.id} />
          ))
        )}
      </div>
    </div>
  )
}
