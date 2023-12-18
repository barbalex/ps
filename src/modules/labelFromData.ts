export const labelFromData = ({ data, table }) => {
  switch (table) {
    case 'projects':
      return data.name ?? data.project_id
      break
    default:
      return undefined
  }
}
