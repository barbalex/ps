import { useCheckTaxonNavData } from '../../../modules/useCheckTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckTaxonFetcher = ({ params, ...other }) => {
  const { navData } = useCheckTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
