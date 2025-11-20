import { useFieldTypesNavData } from '../../../modules/useFieldTypesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FieldTypesFetcher = ({ params, ...other }) => {
  const { navData } = useFieldTypesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
