import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { IoMdInformationCircleOutline } from 'react-icons/io'

const { Button } = fluentUiReactComponents

import { createQc } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useQcsNavData } from '../modules/useQcsNavData.ts'
import { Info } from './qcs/Info.tsx'

import '../form.css'

const from = '/data/qcs'

export const Qcs = () => {
  const navigate = useNavigate({ from })
  const { formatMessage } = useIntl()

  const { navData, loading, isFiltered } = useQcsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const qcsId = await createQc()
    if (!qcsId) return
    navigate({ to: qcsId })
  }

  const openDocs = () =>
    window.open('/docs/quality-controls', '_blank', 'noreferrer')

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
              icon={<IoMdInformationCircleOutline />}
              title={formatMessage({
                id: 'qc.openDocs',
                defaultMessage: 'Dokumentation öffnen',
              })}
              onClick={openDocs}
            />
          </>
        }
        info={<Info />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
