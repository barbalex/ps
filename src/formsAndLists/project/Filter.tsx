import { Filter } from "../../components/shared/Filter/index.tsx";
import { ProjectForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const ProjectFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <ProjectForm
        row={row}
        onChange={(e, data) => onChange(e, data!)}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
