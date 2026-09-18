import { useTaxonomyNavData } from '../../../modules/useTaxonomyNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTaxonomyNavData>[0]
}

export const TaxonomyFetcher = ({ params, ...other }: Props) => {
  const { navData } = useTaxonomyNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
