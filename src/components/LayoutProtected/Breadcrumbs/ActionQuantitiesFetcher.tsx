import { useActionQuantitiesNavData } from '../../../modules/useActionQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionQuantitiesFetcher = ({ params, ...other }) => {
  const { navData } = useActionQuantitiesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
