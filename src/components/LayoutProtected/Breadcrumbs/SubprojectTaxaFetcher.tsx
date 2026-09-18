import { useSubprojectTaxaNavData } from '../../../modules/useSubprojectTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectTaxaNavData>[0]
}

export const SubprojectTaxaFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
