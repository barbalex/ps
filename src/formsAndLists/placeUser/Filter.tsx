import { Filter } from "../../components/shared/Filter/index.tsx";
import { DropdownField } from "../../components/shared/DropdownField.tsx";
import { RadioGroupField } from "../../components/shared/RadioGroupField.tsx";

const userRoles = ["manager", "editor", "reader"];

type Props = {
  from: string;
  level?: number;
};

export const PlaceUserFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange }) => (
      <>
        <DropdownField
          label="User"
          name="user_id"
          table="users"
          value={row.user_id ?? ""}
          onChange={onChange}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={userRoles}
          value={row.role ?? ""}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
);
