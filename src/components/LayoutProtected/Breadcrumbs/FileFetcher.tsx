import { useFileNavData } from '../../../modules/useFileNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId?: string
    subprojectId?: string
    placeId?: string
    placeId2?: string
    actionId?: string
    checkId?: string
    fileId: string
  }
}

export const FileFetcher = ({ params, ...other }: Props) => {
  const { navData } = useFileNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
