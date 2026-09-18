import { useTaxonNavData } from '../../../modules/useTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTaxonNavData>[0]
}

export const TaxonFetcher = ({ params, ...other }: Props) => {
  const { navData } = useTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
