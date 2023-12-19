export const labelFromData = ({ data, table }) => {
  switch (table) {
    case 'projects':
      return data.name ?? data.project_id
      break
    case 'subprojects':
      return data.name ?? data.subproject_id
      break
    case 'accounts':
      return data.account_id
      break
    case 'users':
      return data.email ?? data.user_id
      break
    case 'field_types':
      return data.field_type
      break
    case 'widget_types':
      return data.widget_type
      break
    case 'widgets_for_fields':
      return data.widget_for_field_id
      break
    case 'files':
      return data.name ?? data.file_id
      break
    case 'messages':
      return data.date ?? data.message_id
      break
    case 'place_levels':
      return data.level ?? data.place_level_id
      break
    case 'units':
      return data.name ?? data.unit_id
      break
    case 'lists':
      return data.name ?? data.list_id
      break
    case 'list_values':
      return data.value ?? data.list_value_id
      break
    case 'taxonomies':
      return data.name ?? data.taxonomy_id
      break
    case 'taxa':
      return data.name ?? data.taxon_id
      break
    case 'project_users':
      return data.project_user_id
      break
    case 'project_reports':
      return data.year ?? data.project_report_id
      break
    case 'fields':
      return data.field_id
      break
    case 'observation_sources':
      return data.name ?? data.observation_source_id
      break
    case 'observations':
      return data.observation_id
      break
    case 'persons':
      return data.email ?? data.person_id
      break
    default:
      return undefined
  }
}
