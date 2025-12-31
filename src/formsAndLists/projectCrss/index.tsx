import { useParams, useNavigate } from '@tanstack/react-router'

import { createProjectCrs } from '../../modules/createRows.ts'
import { useProjectCrssNavData } from '../../modules/useProjectCrssNavData.ts'
import { ListHeader } from '../../components/ListHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

const from = '/data/projects/$projectId_/crs/'

export const ProjectCrss = () => {
  const navigate = useNavigate()
  const { projectId } = useParams({ from })

  const { loading, navData } = useProjectCrssNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createProjectCrs({ projectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, projectCrsId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        info={<Info />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map((nav) => (
              <Row key={nav.id} to={nav.id} label={nav.label ?? nav.id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
