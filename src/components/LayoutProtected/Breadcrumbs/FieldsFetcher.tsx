import { useFieldsNavData } from '../../../modules/useFieldsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FieldsFetcher = ({ ...other }) => {
  const { navData } = useFieldsNavData()

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
