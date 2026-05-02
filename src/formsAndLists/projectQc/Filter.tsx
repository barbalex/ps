import { Filter } from '../../components/shared/Filter/index.tsx'
import { ProjectQcForm } from './Form.tsx'

type Props = {
  from: string
}

export const ProjectQcFilter = ({ from }: Props) => (
  <Filter
    from={from}
    tableNameOverride="project_qcs"
  >
    {({ row, onChange }) => (
      <ProjectQcForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)
