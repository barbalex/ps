export const labelFromData = ({ data, table }) => {
  switch (table) {
    case 'places':
      // TODO: build virtual field from data.label, return that here
      return data.place_id
      break
    case 'place_users':
      return data.place_user_id
      break
    case 'subproject_taxa':
      return data.subproject_taxon_id
      break
    case 'subproject_reports':
      return data.year ?? data.subproject_report_id
      break
    case 'goals':
      return data.goal_id
      break
    case 'goal_reports':
      return data.goal_report_id
      break
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
