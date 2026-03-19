import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { createTaxonomy } from '../modules/createRows.ts'
import { useTaxonomiesNavData } from '../modules/useTaxonomiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/taxonomies/'

export const Taxonomies = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const { loading, navData, isFiltered } = useTaxonomiesNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createTaxonomy({ projectId })
    if (!id) return
    navigate({
      to: `${id}/taxonomy`,
      params: (prev) => ({ ...prev, taxonomyId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
        description={formatMessage({
          id: 'nX4TyZ',
          defaultMessage:
            'Taxonomien klassifizieren Objekte (z.\u202fB. Arten, Biotope), meist hierarchisch. Es gibt keine allgemein gültige Art, Arten und Biotope zu klassifizieren. Die genetische Zusammensetzung und die Verbreitung von Arten können im Laufe der Zeit ändern. Biotope verändern ihre Artzusammensetzung. Daher ist eine Taxonomie auch nie abschliessend. Es ist daher normal, dass je nach Kontext verschiedene und in einem einzelnen Projekt auch gleichzeitig mehrere Taxonomien verwendet werden.',
        })}
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
