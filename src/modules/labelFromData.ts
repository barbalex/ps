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
    default:
      return undefined
  }
}
