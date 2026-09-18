import { useFilesNavData } from '../../../modules/useFilesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId?: string
    subprojectId?: string
    placeId?: string
    placeId2?: string
    actionId?: string
    checkId?: string
  }
}

export const FilesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useFilesNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
