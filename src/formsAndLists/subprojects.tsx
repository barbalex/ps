import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createSubproject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { subprojectsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/subprojects/'

export const Subprojects = memo(() => {
  const [filter] = useAtom(subprojectsFilterAtom)

  const { projectId } = useParams({ from })
  const Navigate = useNavigate()
  const db = usePGlite()

  // TODO: ensure passing in filter works as expected (beware of joined table...)
  const filterString = filterStringFromFilter(filter, 'sp')
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      sp.subproject_id, 
      sp.label, 
      p.subproject_name_plural, 
      p.subproject_name_singular 
    FROM 
      subprojects sp 
      INNER JOIN projects p ON p.project_id = sp.project_id 
    WHERE 
      sp.project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY sp.label`,
    [projectId],
    'subproject_id',
  )
  const isLoading = res === undefined
  const subprojects = res?.rows ?? []
  const namePlural = res?.rows?.[0]?.subproject_name_plural ?? 'Subprojects'
  const nameSingular = res?.rows?.[0]?.subproject_name_singular ?? 'Subproject'
  const nameSingularLower = nameSingular.toLowerCase()

  const add = useCallback(async () => {
    const res = await createSubproject({ db, project_id: projectId })
    const data = res?.rows?.[0]
    if (!data) return
    Navigate(`/data/projects/${projectId}/subprojects/${data.subproject_id}`)
  }, [Navigate, db, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural={namePlural}
        nameSingular={nameSingularLower}
        tableName="subprojects"
        isFiltered={isFiltered}
        countFiltered={subprojects.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {subprojects.map(({ subproject_id, label }) => (
              <Row
                key={subproject_id}
                label={label ?? subproject_id}
                to={`/data/projects/${projectId}/subprojects/${subproject_id}`}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
