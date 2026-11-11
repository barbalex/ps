import { useParams, useNavigate } from '@tanstack/react-router'

import { createFieldGroup } from '../modules/createRows.ts'
import { useFieldGroupsNavData } from '../modules/useFieldGroupsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useIntl } from 'react-intl'
import '../form.css'

/**
 * The field groups of one table, e.g. /data/projects/<id>/field-groups/checks.
 */
export const FieldGroups = ({
  hideHeader = false,
  projectId: projectIdProp,
  tableName: tableNameProp,
}: {
  hideHeader?: boolean
  projectId?: string
  tableName?: string
}) => {
  const { projectId: routeProjectId, tableName: routeTableName } = useParams({
    strict: false,
  })
  const projectId = projectIdProp ?? routeProjectId
  const tableName = tableNameProp ?? routeTableName
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const baseUrl = `/data/projects/${projectId}/field-groups/${tableName}`

  const { loading, navData } = useFieldGroupsNavData({
    projectId: projectId!,
    tableName: tableName!,
  })
  const { label, nameSingular } = navData
  const navs = navData.navs as { id: string; label: string }[]

  const add = async () => {
    const id = await createFieldGroup({
      projectId: projectId!,
      tableName: tableName!,
    })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      )}
      <div className="list-container">
        {loading && navs.length === 0 ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`${baseUrl}/${id}`} />
          ))
        )}
        {navs.length === 0 && !loading && (
          <div className="list-empty-hint">
            {formatMessage({
              id: 'pV2cX1',
              defaultMessage:
                'Noch keine Feldergruppe. Mit dem Plus oben rechts eine erstellen.',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
