import { useActionValueNavData } from '../../../modules/useActionValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionValueFetcher = ({ params, ...other }) => {
  const { navData } = useActionValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
