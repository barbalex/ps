import { useActionTaxonNavData } from '../../../modules/useActionTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionTaxonFetcher = ({ params, ...other }) => {
  const { navData } = useActionTaxonNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
