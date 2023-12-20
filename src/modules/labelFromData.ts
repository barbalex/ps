export const labelFromData = ({ data, table }) => {
  switch (table) {
    case 'goal_report_values':
      return data.goal_report_value_id
      break
    case 'subproject_users':
      return data.subproject_user_id
      break
    default:
      return undefined
  }
}
