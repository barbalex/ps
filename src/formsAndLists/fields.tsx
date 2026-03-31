import { useNavigate } from '@tanstack/react-router'

import { createField } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFieldsNavData } from '../modules/useFieldsNavData.ts'
import '../form.css'

export const Fields = ({ hideHeader = false }) => {
  const navigate = useNavigate()
  const fieldsBaseUrl = `/data/fields`

  const { loading, navData, isFiltered } = useFieldsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createField({})
    if (!id) return
    navigate({ to: `${fieldsBaseUrl}/${id}` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
          menus={<FilterButton isFiltered={isFiltered} />}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`${fieldsBaseUrl}/${id}`} />
          ))
        )}
      </div>
    </div>
  )
}
