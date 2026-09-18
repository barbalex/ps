import { useWfsServicesNavData } from '../../../modules/useWfsServicesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
  }
}

export const WfsServicesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWfsServicesNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
