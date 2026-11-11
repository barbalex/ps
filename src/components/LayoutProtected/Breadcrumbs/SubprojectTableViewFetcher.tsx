import { useSubprojectTableViewNavData } from '../../../modules/useSubprojectTableViewNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectTableViewNavData>[0]
}

export const SubprojectTableViewFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useSubprojectTableViewNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
