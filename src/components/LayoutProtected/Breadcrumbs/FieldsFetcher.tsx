import { useFieldsNavData } from '../../../modules/useFieldsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FieldsFetcher = ({ params, ...other }) => {
  const { navData } = useFieldsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
