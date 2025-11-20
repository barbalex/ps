import { useWidgetTypesNavData } from '../../../modules/useWidgetTypesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WidgetTypesFetcher = ({ params, ...other }) => {
  const { navData } = useWidgetTypesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
