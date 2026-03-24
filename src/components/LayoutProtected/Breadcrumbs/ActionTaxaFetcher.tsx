import { useActionTaxaNavData } from '../../../modules/useActionTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionTaxaFetcher = ({ params, ...other }) => {
  const { navData } = useActionTaxaNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
