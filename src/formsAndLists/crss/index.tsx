import { useNavigate } from '@tanstack/react-router'

import { createCrs } from '../../modules/createRows.ts'
import { useCrssNavData } from '../../modules/useCrssNavData.ts'
import { ListHeader } from '../../components/ListHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const CRSS = () => {
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useCrssNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCrs()
    if (!id) return
    navigate({
      to: `/data/crs/${id}`,
      params: (prev) => ({ ...prev, crsId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
        info={<Info />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              to={nav.id}
              label={nav.label ?? nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
