import { useActionValuesNavData } from '../../../modules/useActionValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionValuesFetcher = ({ params, ...other }) => {
  const { navData } = useActionValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
