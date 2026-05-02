import { useParams, useNavigate } from '@tanstack/react-router'

import { createProjectQc } from '../modules/createRows.ts'
import { useProjectQcsNavData } from '../modules/useProjectQcsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from = '/data/projects/$projectId_/qcs/'

export const ProjectQcs = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useProjectQcsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createProjectQc({ projectId })
    if (!id) return
    navigate({ to: `${id}/` })
  }

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
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
