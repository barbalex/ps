import { useActionQuantityNavData } from '../../../modules/useActionQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionQuantityFetcher = ({ params, ...other }) => {
  const { navData } = useActionQuantityNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
