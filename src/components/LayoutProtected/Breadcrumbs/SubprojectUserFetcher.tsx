import { useSubprojectUserNavData } from '../../../modules/useSubprojectUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectUserNavData>[0]
}

export const SubprojectUserFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectUserNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
