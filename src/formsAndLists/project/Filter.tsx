import { Filter } from '../../components/shared/Filter/index.tsx'
import { ProjectForm } from './Form.tsx'

const from = '/data/projects/filter'

export const ProjectFilter = () => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <ProjectForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
)
