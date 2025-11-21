import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const UnitForm = ({ onChange, row, autoFocusRef }) => (
  <>
    <TextField
      label="Name"
      name="name"
      value={row.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
    />
    <SwitchField
      label="Use for action values"
      name="use_for_action_values"
      value={row.use_for_action_values ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for action report values"
      name="use_for_action_report_values"
      value={row.use_for_action_report_values ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for check values"
      name="use_for_check_values"
      value={row.use_for_check_values ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for place report values"
      name="use_for_place_report_values"
      value={row.use_for_place_report_values ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for goal report values"
      name="use_for_goal_report_values"
      value={row.use_for_goal_report_values ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for subproject taxa"
      name="use_for_subproject_taxa"
      value={row.use_for_subproject_taxa ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Use for check taxa"
      name="use_for_check_taxa"
      value={row.use_for_check_taxa ?? false}
      onChange={onChange}
    />
    <SwitchField
      label="Summable"
      name="summable"
      value={row.summable ?? false}
      onChange={onChange}
    />
    <TextField
      label="Sort value"
      name="sort"
      type="number"
      value={row.sort ?? ''}
      onChange={onChange}
    />
    <TextField
      label="List"
      name="list_id"
      value={row.list_id ?? ''}
      onChange={onChange}
    />
  </>
)
