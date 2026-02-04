import { useDataNavData } from '../../modules/useDataNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const RootList = () => {
  const { loading, navData } = useDataNavData()
  const { navs, label } = navData

  return (
    <div className="list-view">
      <FormHeader title={label} />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              label={nav.label}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
