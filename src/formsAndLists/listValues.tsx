import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createListValue } from '../modules/createRows.ts'
import { useListValuesNavData } from '../modules/useListValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/lists/$listId_/values/'

export const ListValues = () => {
  const { projectId, listId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useListValuesNavData({ projectId, listId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createListValue({ db, listId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, listValueId: id }),
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
        : <>
            {navs.map(({ list_value_id, label }) => (
              <Row
                key={list_value_id}
                to={list_value_id}
                label={label ?? list_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
