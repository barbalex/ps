import { useActionNavData } from '../../../modules/useActionNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionFetcher = ({ params, ...other }) => {
  const { navData } = useActionNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
