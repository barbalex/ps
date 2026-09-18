import { useProjectQcsNavData } from '../../../modules/useProjectQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectQcsNavData>[0]
}

export const ProjectQcsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectQcsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
