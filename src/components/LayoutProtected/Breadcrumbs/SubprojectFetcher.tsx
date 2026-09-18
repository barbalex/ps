import { useSubprojectNavData } from '../../../modules/useSubprojectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectNavData>[0]
}

export const SubprojectFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
