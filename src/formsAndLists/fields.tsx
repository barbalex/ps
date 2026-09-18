import { useParams, useNavigate } from '@tanstack/react-router'

import { createField } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldsNavData } from '../modules/useFieldsNavData.ts'
import '../form.css'

export const Fields = ({ hideHeader = false, projectId: projectIdProp }: { from: string; hideHeader?: boolean; projectId?: string }) => {
  const params = useParams({ strict: false }) as Record<string, string | undefined>
  const projectId = projectIdProp ?? params.projectId ?? params.projectId_
  const userId = params.userId ?? params.userId_
  const accountId = params.accountId ?? params.accountId_
  const navigate = useNavigate()
  const fieldsBaseUrl = projectId
    ? `/data/projects/${projectId}/fields`
    : `/data/users/${userId}/accounts/${accountId}/project-fields`

  const { loading, navData, isFiltered } = useFieldsNavData({
    projectId,
    accountId,
    userId,
  })
  const { label, nameSingular } = navData
  const navs = navData.navs as {
    id: string
    label: string
    table_name?: string | null
    level?: number | null
    name?: string | null
  }[]

  const add = async () => {
    if (!projectId && !accountId) return
    const id = await createField({
      projectId,
      accountId,
      table_name: accountId ? 'projects' : null,
    })
    if (!id) return
    navigate({ to: `${fieldsBaseUrl}/${id}` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
          menus={<FilterButton isFiltered={isFiltered} />}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`${fieldsBaseUrl}/${id}`} />
          ))
        )}
      </div>
    </div>
  )
}
