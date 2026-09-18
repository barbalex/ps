import { useExportsNavData } from '../../../modules/useExportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

// upstream hook takes no params; the passed params are ignored at runtime
const useExportsNavDataWithParams = useExportsNavData as (
  params: Props['params'],
) => ReturnType<typeof useExportsNavData>

export const ExportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useExportsNavDataWithParams(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
