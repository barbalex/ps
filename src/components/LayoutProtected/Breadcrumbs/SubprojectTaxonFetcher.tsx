import { useSubprojectTaxonNavData } from '../../../modules/useSubprojectTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectTaxonNavData>[0]
}

export const SubprojectTaxonFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
