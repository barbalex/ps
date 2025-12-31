import { useParams, useNavigate } from '@tanstack/react-router'

import { createUnit } from '../modules/createRows.ts'
import { useUnitsNavData } from '../modules/useUnitsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/units/'

export const Units = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useUnitsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createUnit({ projectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, unitId: id }),
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
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ id, label }) => (
              <Row key={id} label={label ?? id} to={id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
