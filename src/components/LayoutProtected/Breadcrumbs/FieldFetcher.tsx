import { useFieldNavData } from '../../../modules/useFieldNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FieldFetcher = ({ params, ...other }) => {
  const { navData } = useFieldNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
