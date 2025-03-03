import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { fieldsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(fieldsFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT field_id, label FROM fields WHERE project_id ${
      project_id ? `= '${project_id}'` : 'IS NULL'
    }${isFiltered ? ` AND(${filter})` : ''} order by table_name, name, level`,
    undefined,
    'field_id',
  )
  const isLoading = res === undefined
  const fields = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createField({ project_id, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.field_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Fields"
        nameSingular="Field"
        tablename="fields"
        isFiltered={isFiltered}
        countFiltered={fields.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {fields.map(({ field_id, label }) => (
              <Row
                key={field_id}
                label={label ?? field_id}
                to={field_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
