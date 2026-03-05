import { useNavigate, useParams } from '@tanstack/react-router'

import { createObservationImport } from '../modules/createRows.ts'
import { useObservationImportsNavData } from '../modules/useObservationImportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/'

export const ObservationImports = () => {
  const navigate = useNavigate()
  const { projectId, subprojectId } = useParams({ from })

  const { loading, navData, isFiltered } = useObservationImportsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createObservationImport({ subprojectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        observationImportId: id,
      }),
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
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
