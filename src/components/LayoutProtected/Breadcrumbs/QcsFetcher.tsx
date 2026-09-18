import { useQcsNavData } from '../../../modules/useQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

// upstream hook takes no params; the passed params are ignored at runtime
const useQcsNavDataWithParams = useQcsNavData as (
  params: Props['params'],
) => ReturnType<typeof useQcsNavData>

export const QcsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useQcsNavDataWithParams(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
