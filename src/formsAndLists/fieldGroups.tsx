import { useParams, useNavigate } from '@tanstack/react-router'

import { createFieldGroup } from '../modules/createRows.ts'
import { useFieldGroupsNavData } from '../modules/useFieldGroupsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const FieldGroups = ({
  hideHeader = false,
  projectId: projectIdProp,
}: {
  hideHeader?: boolean
  projectId?: string
}) => {
  const { projectId: routeProjectId } = useParams({ strict: false })
  const projectId = projectIdProp ?? routeProjectId
  const navigate = useNavigate()
  const baseUrl = `/data/projects/${projectId}/field-groups`

  const { loading, navData } = useFieldGroupsNavData({
    projectId: projectId!,
  })
  const { label, nameSingular } = navData
  const navs = navData.navs as { id: string; label: string }[]

  const add = async () => {
    const id = await createFieldGroup({ projectId: projectId! })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}/` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`${baseUrl}/${id}/`} />
          ))
        )}
      </div>
    </div>
  )
}
