import { useTaxonomyTaxonomyNavData } from '../../../modules/useTaxonomyTaxonomyNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTaxonomyTaxonomyNavData>[0]
}

export const TaxonomyTaxonomyFetcher = ({ params, ...other }: Props) => {
  const { navData } = useTaxonomyTaxonomyNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
