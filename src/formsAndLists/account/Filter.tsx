import { Filter } from "../../components/shared/Filter/index.tsx";
import { DropdownField } from "../../components/shared/DropdownField.tsx";
import { DateField } from "../../components/shared/DateField.tsx";
import { RadioGroupField } from "../../components/shared/RadioGroupField.tsx";

type Props = {
  from: string;
};

export const AccountFilter = ({ from }: Props) => (
  <Filter from={from}>
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
          label="Type"
          name="type"
          list={["trial", "free", "basic", "premium"]}
          value={row.type ?? ""}
          onChange={onChange}
        />
        <DateField
          label="Starts"
          name="period_start"
          value={row.period_start}
          onChange={onChange}
        />
        <DateField
          label="Ends"
          name="period_end"
          value={row.period_end}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
);
