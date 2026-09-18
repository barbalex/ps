import { useWfsServiceLayersNavData } from '../../../modules/useWfsServiceLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wfsServiceId: string
  }
}

export const WfsServiceLayersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWfsServiceLayersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
