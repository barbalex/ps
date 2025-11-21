import { useCheckTaxaNavData } from '../../../modules/useCheckTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckTaxaFetcher = ({ params, ...other }) => {
  const { navData } = useCheckTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
