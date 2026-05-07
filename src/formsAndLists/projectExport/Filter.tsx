import { Filter } from '../../components/shared/Filter/index.tsx'
import { ProjectExportForm } from './Form.tsx'

type Props = {
  from: string
}

export const ProjectExportFilter = ({ from }: Props) => (
  <Filter from={from} tableNameOverride="project_exports">
    {({ row, onChange }) => (
      <ProjectExportForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)
