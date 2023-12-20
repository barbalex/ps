export const labelFromData = ({ data, table }) => {
  switch (table) {
    case 'subproject_users':
      return data.subproject_user_id
      break
    default:
      return undefined
  }
}
