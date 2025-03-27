import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createFieldType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldTypesNavData } from '../modules/useFieldTypesNavData.ts'

import '../form.css'

const from = '/data/_authLayout/field-types'

export const FieldTypes = memo(() => {
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { isLoading, navData, isFiltered } = useFieldTypesNavData()

  const add = useCallback(async () => {
    const res = await createFieldType({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.field_type_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Field Types"
        nameSingular="Field Type"
        tablename="field_types"
        isFiltered={isFiltered}
        countFiltered={navData.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {navData.map(({ field_type_id, label }) => (
              <Row
                key={field_type_id}
                label={label ?? field_type_id}
                to={field_type_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
