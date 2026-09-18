import { useFieldTypesNavData } from '../../../modules/useFieldTypesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

// upstream hook takes no params; the passed params are ignored at runtime
const useFieldTypesNavDataWithParams = useFieldTypesNavData as (
  params: Props['params'],
) => ReturnType<typeof useFieldTypesNavData>

export const FieldTypesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useFieldTypesNavDataWithParams(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
