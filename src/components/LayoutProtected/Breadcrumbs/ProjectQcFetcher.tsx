import { useProjectQcNavData } from '../../../modules/useProjectQcNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectQcNavData>[0]
}

export const ProjectQcFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectQcNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
