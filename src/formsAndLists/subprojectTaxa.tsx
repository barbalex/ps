import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../modules/createRows.ts'
import { useSubprojectTaxaNavData } from '../modules/useSubprojectTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { languageAtom } from '../store.ts'
import { subprojectNameSingularExpr } from '../modules/subprojectNameCols.ts'
import '../form.css'

export const SubprojectTaxa = ({ from, hideHeader = false }) => {
  const { projectId, subprojectId } = useParams({ strict: false, from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const taxaBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/taxa`

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const subprojectNameSingular =
    projectRes?.rows?.[0]?.subproject_name_singular ?? ''

  const { loading, navData, isFiltered } = useSubprojectTaxaNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData
  const canFilter =
    !hideHeader &&
    from === '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/'

  const add = async () => {
    const id = await createSubprojectTaxon({ subprojectId })
    if (!id) return
    navigate({ to: `${taxaBaseUrl}/${id}/` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
          menus={
            canFilter ? <FilterButton isFiltered={isFiltered} /> : undefined
          }
          description={formatMessage(
            {
              id: 'gP1QrT',
              defaultMessage:
                'Liste der Taxa, die in diesem {subprojectNameSingular}-Teilprojekt vertreten sind. Beispiele: Synonyme einer Taxonomie oder aus verschiedenen Taxonomien. Ein Taxon sollte in höchstens einem Teilprojekt verwendet werden.',
            },
            { subprojectNameSingular },
          )}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={`${taxaBaseUrl}/${id}/`} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
