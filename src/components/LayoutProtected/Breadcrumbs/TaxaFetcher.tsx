import { useTaxaNavData } from '../../../modules/useTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const TaxaFetcher = ({ params, ...other }) => {
  const { navData } = useTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
