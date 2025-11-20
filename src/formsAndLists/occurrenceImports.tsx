import { useNavigate, useParams } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createOccurrenceImport } from '../modules/createRows.ts'
import { useOccurrenceImportsNavData } from '../modules/useOccurrenceImportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/'

export const OccurrenceImports = () => {
  const navigate = useNavigate()
  const { projectId, subprojectId } = useParams({ from })
  const db = usePGlite()

  const { loading, navData } = useOccurrenceImportsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createOccurrenceImport({ subprojectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.occurrence_import_id,
      params: (prev) => ({
        ...prev,
        occurrenceImportId: data.occurrence_import_id,
      }),
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
