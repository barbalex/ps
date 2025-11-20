import { useSubprojectTaxaNavData } from '../../../modules/useSubprojectTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectTaxaFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
