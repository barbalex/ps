export const buildNavs = async ({
  table,
  check_id,
  action_id,
  action_report_id,
  project_id,
  subproject_id,
  place_id,
  place_id2,
  place_report_id,
  goal_id,
  goal_report_id,
  list_id,
  vector_layer_id,
  taxonomy_id,
  chart_id,
  // chart_subject_id,
  db,
  level = 1,
  designing,
}) => {
  // if table is places, get place_level for this level
  let placeLevel = {}
  if (table === 'places') {
    // findUnique only works for primary keys
    const res = await db.query(
      `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
      [project_id, level],
    )
    const placeLevels = res?.rows
    placeLevel = placeLevels?.[0] ?? {}
  }
  // need project for it's settings
  const projectRes = await db.query(
    `SELECT * FROM projects WHERE project_id = $1`,
    [project_id],
  )
  const project = projectRes?.rows?.[0] ?? {}
  const filesActiveProjects = project?.files_active_projects ?? false
  const filesActiveSubprojects = project?.files_active_subprojects ?? false
  const filesActivePlaces = project?.files_active_places ?? false
  const filesActiveActions = project?.files_active_actions ?? false
  const filesActiveChecks = project?.files_active_checks ?? false

  switch (table) {
    case 'root':
      return [
        { path: '/data/projects', text: 'Projects' },
        { path: '/data/users', text: 'Users' },
        { path: '/data/accounts', text: 'Accounts' },
        { path: '/data/messages', text: 'Messages' },
        { path: '/docs', text: 'Docs' },
        ...(designing ?
          [
            {
              path: '/data/field-types',
              text: 'Field Types',
              showOnlyWhenDesigning: true,
            },
            {
              path: '/data/widget-types',
              text: 'Widget Types',
              showOnlyWhenDesigning: true,
            },
            {
              path: '/data/widgets-for-fields',
              text: 'Widgets For Fields',
              showOnlyWhenDesigning: true,
            },
            {
              path: '/data/fields',
              text: 'Fields',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/crs`,
              text: 'CRS',
              showOnlyWhenDesigning: true,
            },
          ]
        : []),
      ]
      break
    case `projects`: {
      // fetch projects.subproject_name_plural to name subprojects
      const projectRes = await db.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id],
      )
      const project = projectRes?.rows?.[0]
      const subprojectName = project?.subproject_name_plural ?? 'Subprojects'

      return [
        {
          path: `/data/projects/${project_id}/subprojects`,
          text: subprojectName,
        },
        {
          path: `/data/projects/${project_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/data/projects/${project_id}/persons`,
          text: 'Persons',
        },
        {
          path: `/data/projects/${project_id}/wms-layers`,
          text: 'WMS Layers',
        },
        {
          path: `/data/projects/${project_id}/vector-layers`,
          text: 'Vector Layers',
        },
        ...(filesActiveProjects ?
          [
            {
              path: `/data/projects/${project_id}/files`,
              text: 'Files',
            },
          ]
        : []),
        ...(designing ?
          [
            {
              path: `/data/projects/${project_id}/users`,
              text: 'Users',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${project_id}/lists`,
              text: 'Lists',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${project_id}/taxonomies`,
              text: 'Taxonomies',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${project_id}/units`,
              text: 'Units',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${project_id}/crs`,
              text: 'CRS',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${project_id}/place-levels`,
              text: 'Place Levels',
            },
            {
              path: `/data/projects/${project_id}/fields`,
              text: 'Fields',
              showOnlyWhenDesigning: true,
            },
          ]
        : []),
      ]
    }
    case 'subprojects': {
      // need to fetch how places are named
      const plRes = await db.query(
        `SELECT * FROM place_levels WHERE project_id = $1 AND level = 1`,
        [project_id],
      )
      const placeLevels = plRes?.rows
      const placeLevel = placeLevels?.[0]
      const placeName =
        placeLevel?.name_plural ?? placeLevel?.name_short ?? 'Places'

      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places`,
          text: placeName,
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/goals`,
          text: 'Goals',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess`,
          text: 'Occurrences to assess',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/occurrences-not-to-assign`,
          text: 'Occurrences not to assign',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/taxa`,
          text: 'Taxa',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/users`,
          text: 'Users',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/charts`,
          text: 'Charts',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/occurrence-imports`,
          text: 'Occurrence Imports',
        },
        ...(filesActiveSubprojects ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    }
    case 'places': {
      // if place_id exists, this is at least level 2
      // if place_id2 exists, do not add any more place levels
      // add second place level if exists
      // name it as defined in place_levels
      const needToIncludeLevel2 = place_id && !place_id2
      let placeName = 'Places'
      if (needToIncludeLevel2) {
        // findUnique only works for primary keys
        const plRes = await db.query(
          `SELECT * FROM place_levels WHERE project_id = $1 AND level = 2`,
          [project_id],
        )
        const placeLevels = plRes?.rows
        const placeLevel2 = placeLevels?.[0]
        placeName =
          placeLevel2?.name_plural ?? placeLevel2?.name_short ?? 'Places'
      }

      return [
        ...(needToIncludeLevel2 ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/places`,
              text: placeName,
            },
          ]
        : []),
        ...(placeLevel.checks ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/checks`,
              text: 'Checks',
            },
          ]
        : []),
        ...(placeLevel.actions ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/actions`,
              text: 'Actions',
            },
          ]
        : []),
        ...(placeLevel.reports ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/reports`,
              text: 'Reports',
            },
          ]
        : []),
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/occurrences-assigned`,
          text: 'Occurrences assigned',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/users`,
          text: 'Users',
        },
        ...(filesActivePlaces ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    }
    case 'checks': {
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/checks/${check_id}/values`,
          text: 'Values',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/checks/${check_id}/taxa`,
          text: 'Taxa',
        },
        ...(filesActiveChecks ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/checks/${check_id}/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    }
    case 'actions':
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/values`,
          text: 'Values',
        },
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/reports`,
          text: 'Reports',
        },
        ...(filesActiveActions ?
          [
            {
              path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                level === 2 ? `/places/${place_id2}` : ''
              }/actions/${action_id}/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    case 'action_reports':
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/reports/${action_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'place_reports':
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/reports/${place_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'goals':
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
          text: 'Reports',
        },
      ]
    case 'goal_reports':
      return [
        {
          path: `/data/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'lists':
      return [
        {
          path: `/data/projects/${project_id}/lists/${list_id}/values`,
          text: 'Values',
        },
      ]
    case 'vector_layers':
      return [
        {
          path: `/data/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays`,
          text: 'Displays',
        },
      ]
    case 'taxonomies':
      return [
        {
          path: `/data/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`,
          text: 'Taxa',
        },
      ]
    case 'charts':
      return [
        {
          path: `${project_id ? `/data/projects/${project_id}` : ''}${
            subproject_id ? `/subprojects/${subproject_id}` : ''
          }${place_id ? `/places/${place_id}` : ''}${
            place_id2 ? `/places/${place_id2}` : ''
          }/charts/${chart_id}/subjects`,
          text: 'Subjects',
        },
      ]
    default: {
      return null
    }
  }
}
