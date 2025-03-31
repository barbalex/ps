import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createFieldType } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldTypesNavData } from '../modules/useFieldTypesNavData.ts'

import '../form.css'

const from = '/data/_authLayout/field-types'

export const FieldTypes = memo(() => {
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { loading, navData, isFiltered } = useFieldTypesNavData()
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createFieldType({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.field_type_id })
  }, [db, navigate])

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
})
