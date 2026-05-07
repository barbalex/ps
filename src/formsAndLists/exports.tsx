import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdMenuBook } from 'react-icons/md'

import { createExport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useExportsNavData } from '../modules/useExportsNavData.ts'

import '../form.css'

const { Button } = fluentUiReactComponents

const from = '/data/exports'

export const Exports = () => {
  const navigate = useNavigate({ from })
  const { formatMessage } = useIntl()

  const { navData, loading, isFiltered } = useExportsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const exportsId = await createExport()
    if (!exportsId) return
    navigate({ to: exportsId })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
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
          navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
            />
          ))
        )}
      </div>
    </div>
  )
}
