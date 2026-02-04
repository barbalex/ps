import { useParams, useNavigate } from '@tanstack/react-router'

import { createPerson } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePersonsNavData } from '../modules/usePersonsNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/persons/'

export const Persons = () => {
  const navigate = useNavigate()
  const { projectId } = useParams({ from })

  const { loading, navData, isFiltered } = usePersonsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPerson({ projectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, personId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
