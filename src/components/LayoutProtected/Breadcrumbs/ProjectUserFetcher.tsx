import { useProjectUserNavData } from '../../../modules/useProjectUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectUserNavData>[0]
}

export const ProjectUserFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectUserNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
