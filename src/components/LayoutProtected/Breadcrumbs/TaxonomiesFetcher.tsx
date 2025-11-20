import { useTaxonomiesNavData } from '../../../modules/useTaxonomiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const TaxonomiesFetcher = ({ params, ...other }) => {
  const { navData } = useTaxonomiesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
