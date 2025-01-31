import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { fieldsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(fieldsFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const resultsFiltered = useLiveQuery(
    `SELECT * FROM fields WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by sort_index ASC, label ASC`,
    [project_id ?? null],
  )
  const fields = resultsFiltered?.rows ?? []

  const add = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate({ pathname: data.field_id, search: searchParams.toString() })
  }, [db.fields, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Fields"
        nameSingular="Field"
        tablename="fields"
        isFiltered={isFiltered}
        countFiltered={fields.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {fields.map(({ field_id, label }) => (
          <Row
            key={field_id}
            label={label ?? field_id}
            to={field_id}
          />
        ))}
      </div>
    </div>
  )
})
