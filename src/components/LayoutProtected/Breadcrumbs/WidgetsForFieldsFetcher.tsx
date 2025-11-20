import { useWidgetsForFieldsNavData } from '../../../modules/useWidgetsForFieldsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WidgetsForFieldsFetcher = ({ params, ...other }) => {
  const { navData } = useWidgetsForFieldsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
