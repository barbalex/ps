import { useWidgetForFieldNavData } from '../../../modules/useWidgetForFieldNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WidgetForFieldFetcher = ({ params, ...other }) => {
  const { navData } = useWidgetForFieldNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
