import { useTaxonNavData } from '../../../modules/useTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const TaxonFetcher = ({ params, ...other }) => {
  const { navData } = useTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
