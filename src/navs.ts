export const navs = ({ path, match }) => {
  // console.log('navs:', { path, match })
  switch (path) {
    case '/':
      return [
        { path: '/users', text: 'Users' },
        { path: '/accounts', text: 'Accounts' },
        { path: '/projects', text: 'Projects' },
        { path: '/field-types', text: 'Field Types' },
        { path: '/widget-types', text: 'Widget Types' },
        { path: '/widgets-for-fields', text: 'Widgets For Fields' },
        { path: '/files', text: 'Files' },
        { path: '/messages', text: 'Messages' },
        { path: '/docs', text: 'Docs' },
      ]
      break
    case `project_id`:
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects`,
          text: 'Subprojects',
        },
        {
          path: `/projects/${match.params.project_id}/place-levels`,
          text: 'Place Levels',
        },
        { path: `/projects/${match.params.project_id}/units`, text: 'Units' },
        { path: `/projects/${match.params.project_id}/lists`, text: 'Lists' },
        {
          path: `/projects/${match.params.project_id}/taxonomies`,
          text: 'Taxonomies',
        },
        { path: `/projects/${match.params.project_id}/users`, text: 'Users' },
        {
          path: `/projects/${match.params.project_id}/reports`,
          text: 'Reports',
        },
        { path: `/projects/${match.params.project_id}/fields`, text: 'Fields' },
        {
          path: `/projects/${match.params.project_id}/observation-sources`,
          text: 'Observation Sources',
        },
        {
          path: `/projects/${match.params.project_id}/persons`,
          text: 'Persons',
        },
      ]
    case 'subproject_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places`,
          text: 'Places',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/users`,
          text: 'Users',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/taxa`,
          text: 'Taxa',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals`,
          text: 'Goals',
        },
      ]
    case 'place_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/checks`,
          text: 'Checks',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/actions`,
          text: 'Actions',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/users`,
          text: 'Users',
        },
      ]
    case 'check_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/checks/${match.params.check_id}/values`,
          text: 'Values',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/checks/${match.params.check_id}/taxa`,
          text: 'Taxa',
        },
      ]
    case 'action_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/actions/${match.params.action_id}/values`,
          text: 'Values',
        },
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/actions/${match.params.action_id}/reports`,
          text: 'Reports',
        },
      ]
    case 'action_report_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/actions/${match.params.action_id}/reports/${match.params.action_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'place_report_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}/reports/${match.params.place_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'goal_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals/${match.params.goal_id}/reports`,
          text: 'Reports',
        },
      ]
    case 'goal_report_id':
      return [
        {
          path: `/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals/${match.params.goal_id}/reports/${match.params.goal_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'list_id':
      return [
        {
          path: `/projects/${match.params.project_id}/lists/${match.params.list_id}/values`,
          text: 'Values',
        },
      ]
    case 'taxonomy_id':
      return [
        {
          path: `/projects/${match.params.project_id}/taxonomies/${match.params.taxonomy_id}/taxa`,
          text: 'Taxa',
        },
      ]
    case 'observation_source_id':
      return [
        {
          path: `/projects/${match.params.project_id}/observation-sources/${match.params.observation_source_id}/observations`,
          text: 'Observations',
        },
      ]
    default: {
      return null
    }
  }
}
