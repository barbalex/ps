import { useTaxaNavData } from '../../../modules/useTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTaxaNavData>[0]
}

export const TaxaFetcher = ({ params, ...other }: Props) => {
  const { navData } = useTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
