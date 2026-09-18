import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdMenuBook } from 'react-icons/md'

import { createProjectExport } from '../modules/createRows.ts'
import { useProjectExportsNavData } from '../modules/useProjectExportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const { Button } = fluentUiReactComponents


export const ProjectExports = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const { loading, navData, isFiltered } = useProjectExportsNavData({projectId: projectId! })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createProjectExport({projectId: projectId! })
    if (!id) return
    navigate({ to: `${id}/` })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        description={formatMessage({
          id: 'projectExports.description',
          defaultMessage:
            'Hier kannst du eigene Exporte erstellen. Sie sind in diesem Projekt verfügbar.',
        })}
        addRow={add}
        menus={
          <>
            <FilterButton isFiltered={isFiltered} />
            <Button
              icon={<MdMenuBook />}
              title={formatMessage({
                id: 'exports.openDocs',
                defaultMessage: 'Dokumentation öffnen',
              })}
              onClick={() =>
                window.open('/docs/exports', '_blank', 'noreferrer')
              }
            />
          </>
        }
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
