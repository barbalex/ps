import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createField } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldsNavData } from '../modules/useFieldsNavData.ts'
import '../form.css'

export const Fields = ({ from }) => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const { loading, navData, isFiltered } = useFieldsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createField({ projectId, db })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, fieldId: id }),
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
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
