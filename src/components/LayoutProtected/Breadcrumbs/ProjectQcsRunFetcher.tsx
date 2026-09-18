import { useProjectQcsRunNavData } from '../../../modules/useProjectQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectQcsRunNavData>[0]
}

export const ProjectQcsRunFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectQcsRunNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
