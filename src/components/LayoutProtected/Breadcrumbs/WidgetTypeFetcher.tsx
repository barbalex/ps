import { useWidgetTypeNavData } from '../../../modules/useWidgetTypeNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WidgetTypeFetcher = ({ params, ...other }) => {
  const { navData } = useWidgetTypeNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
