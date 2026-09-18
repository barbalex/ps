import { useTaxonomiesNavData } from '../../../modules/useTaxonomiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTaxonomiesNavData>[0]
}

export const TaxonomiesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useTaxonomiesNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
