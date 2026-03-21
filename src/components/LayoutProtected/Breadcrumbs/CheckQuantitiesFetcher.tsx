import { useCheckQuantitiesNavData } from '../../../modules/useCheckQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckQuantitiesFetcher = ({ params, ...other }) => {
  const { navData } = useCheckQuantitiesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
