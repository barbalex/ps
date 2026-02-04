import { useParams, useNavigate } from '@tanstack/react-router'

import { createTaxonomy } from '../modules/createRows.ts'
import { useTaxonomiesNavData } from '../modules/useTaxonomiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/taxonomies/'

export const Taxonomies = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useTaxonomiesNavData({ projectId })
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
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
