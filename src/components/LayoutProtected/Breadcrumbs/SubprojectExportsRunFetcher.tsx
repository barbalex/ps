import { useSubprojectExportsRunNavData } from '../../../modules/useSubprojectExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectExportsRunNavData>[0]
}

export const SubprojectExportsRunFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectExportsRunNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
