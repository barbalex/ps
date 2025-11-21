import { useActionsNavData } from '../../../modules/useActionsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionsFetcher = ({ params, ...other }) => {
  const { navData } = useActionsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
