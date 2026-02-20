import { Filter } from "../../components/shared/Filter/index.tsx";
import { ProjectReportForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const ProjectReportFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <ProjectReportForm row={row} onChange={onChange} orIndex={orIndex} />
    )}
  </Filter>
);
