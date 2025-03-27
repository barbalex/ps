import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldsNavData } from '../modules/useFieldsNavData.ts'
import '../form.css'

export const Fields = memo(({ from }) => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const { loading, navData, isFiltered } = useFieldsNavData({ projectId })

  const add = useCallback(async () => {
    const res = await createField({ projectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.field_id,
      params: (prev) => ({ ...prev, fieldId: data.field_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Fields"
        nameSingular="Field"
        tablename="fields"
        isFiltered={isFiltered}
        countFiltered={navData.length}
        isLoading={loading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navData.map(({ field_id, label }) => (
              <Row
                key={field_id}
                label={label ?? field_id}
                to={field_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
