import { useTaxonomyNavData } from '../../../modules/useTaxonomyNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const TaxonomyFetcher = ({ params, ...other }) => {
  const { navData } = useTaxonomyNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
