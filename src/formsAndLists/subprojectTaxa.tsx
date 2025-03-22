import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/taxa/'

export const SubprojectTaxa = memo(() => {
  const { subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT subproject_taxon_id, label FROM subproject_taxa WHERE subproject_id = $1 ORDER BY label`,
    [subprojectId],
    'subproject_taxon_id',
  )
  const isLoading = res === undefined
  const subprojectTaxa = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectTaxon({ subprojectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.subproject_taxon_id,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: data.subproject_taxon_id,
      }),
    })
  }, [db, navigate, subprojectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Subproject Taxa"
        nameSingular="Subproject Taxon"
        tableName="subproject_taxa"
        isFiltered={false}
        countFiltered={subprojectTaxa.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {subprojectTaxa.map(({ subproject_taxon_id, label }) => (
              <Row
                key={subproject_taxon_id}
                to={subproject_taxon_id}
                label={label ?? subproject_taxon_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
