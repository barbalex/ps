import { useSubprojectTaxonNavData } from '../../../modules/useSubprojectTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectTaxonFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
