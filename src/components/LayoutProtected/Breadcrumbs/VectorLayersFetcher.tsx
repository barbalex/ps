import { useVectorLayersNavData } from '../../../modules/useVectorLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
  }
}

export const VectorLayersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
