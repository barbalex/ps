import { useParams, useNavigate } from '@tanstack/react-router'

import { createList } from '../modules/createRows.ts'
import { useListsNavData } from '../modules/useListsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'


export const Lists = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useListsNavData({projectId: projectId! })
  const { label, nameSingular } = navData
  const navs = navData.navs as { id: string; label: string }[]

  const add = async () => {
    const id = await createList({projectId: projectId! })
    if (!id) return
    navigate({
      to: `${id}/list`,
      params: (prev) => ({ ...prev, listId: id }),
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
