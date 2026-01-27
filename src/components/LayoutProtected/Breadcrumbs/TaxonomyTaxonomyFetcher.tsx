import { useTaxonomyTaxonomyNavData } from '../../../modules/useTaxonomyTaxonomyNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const TaxonomyTaxonomyFetcher = ({ params, ...other }) => {
  const { navData } = useTaxonomyTaxonomyNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
