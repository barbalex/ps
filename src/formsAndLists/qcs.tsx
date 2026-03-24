import { useNavigate } from '@tanstack/react-router'

import { createQc } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useQcsNavData } from '../modules/useQcsNavData.ts'

import '../form.css'

const from = '/data/qcs'

export const Qcs = () => {
  const navigate = useNavigate({ from })

  const { navData, loading, isFiltered } = useQcsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const qcsId = await createQc()
    if (!qcsId) return
    navigate({ to: qcsId })
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
