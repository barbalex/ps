export const buildNavs = async ({
  table,
  checkId,
  actionId,
  actionReportId,
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeReportId,
  goalId,
  goalReportId,
  listId,
  vectorLayerId,
  taxonomyId,
  chartId,
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
      [projectId, level],
    )
    const placeLevels = res?.rows
    placeLevel = placeLevels?.[0] ?? {}
  }
  // need project for it's settings
  const projectRes = await db.query(
    `SELECT * FROM projects WHERE project_id = $1`,
    [projectId],
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
        [projectId],
      )
      const project = projectRes?.rows?.[0]
      const subprojectName = project?.subproject_name_plural ?? 'Subprojects'

      return [
        {
          path: `/data/projects/${projectId}/subprojects`,
          text: subprojectName,
        },
        {
          path: `/data/projects/${projectId}/reports`,
          text: 'Reports',
        },
        {
          path: `/data/projects/${projectId}/persons`,
          text: 'Persons',
        },
        {
          path: `/data/projects/${projectId}/wms-layers`,
          text: 'WMS Layers',
        },
        {
          path: `/data/projects/${projectId}/vector-layers`,
          text: 'Vector Layers',
        },
        ...(filesActiveProjects ?
          [
            {
              path: `/data/projects/${projectId}/files`,
              text: 'Files',
            },
          ]
        : []),
        ...(designing ?
          [
            {
              path: `/data/projects/${projectId}/users`,
              text: 'Users',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${projectId}/lists`,
              text: 'Lists',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${projectId}/taxonomies`,
              text: 'Taxonomies',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${projectId}/units`,
              text: 'Units',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${projectId}/crs`,
              text: 'CRS',
              showOnlyWhenDesigning: true,
            },
            {
              path: `/data/projects/${projectId}/place-levels`,
              text: 'Place Levels',
            },
            {
              path: `/data/projects/${projectId}/fields`,
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
        [projectId],
      )
      const placeLevels = plRes?.rows
      const placeLevel = placeLevels?.[0]
      const placeName =
        placeLevel?.name_plural ?? placeLevel?.name_short ?? 'Places'

      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places`,
          text: placeName,
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/reports`,
          text: 'Reports',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/goals`,
          text: 'Goals',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/occurrences-to-assess`,
          text: 'Occurrences to assess',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/occurrences-not-to-assign`,
          text: 'Occurrences not to assign',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/taxa`,
          text: 'Taxa',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/users`,
          text: 'Users',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/charts`,
          text: 'Charts',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/occurrence-imports`,
          text: 'Occurrence Imports',
        },
        ...(filesActiveSubprojects ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/files`,
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
      const needToIncludeLevel2 = placeId && !placeId2
      let placeName = 'Places'
      if (needToIncludeLevel2) {
        // findUnique only works for primary keys
        const plRes = await db.query(
          `SELECT * FROM place_levels WHERE project_id = $1 AND level = 2`,
          [projectId],
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
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places`,
              text: placeName,
            },
          ]
        : []),
        ...(placeLevel.checks ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
              }/checks`,
              text: 'Checks',
            },
          ]
        : []),
        ...(placeLevel.actions ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
              }/actions`,
              text: 'Actions',
            },
          ]
        : []),
        ...(placeLevel.reports ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
              }/reports`,
              text: 'Reports',
            },
          ]
        : []),
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/occurrences`,
          text: 'Occurrences assigned',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/users`,
          text: 'Users',
        },
        ...(filesActivePlaces ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
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
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/checks/${checkId}/values`,
          text: 'Values',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/checks/${checkId}/taxa`,
          text: 'Taxa',
        },
        ...(filesActiveChecks ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
              }/checks/${checkId}/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    }
    case 'actions':
      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/actions/${actionId}/values`,
          text: 'Values',
        },
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/actions/${actionId}/reports`,
          text: 'Reports',
        },
        ...(filesActiveActions ?
          [
            {
              path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
                level === 2 ? `/places/${placeId2}` : ''
              }/actions/${actionId}/files`,
              text: 'Files',
            },
          ]
        : []),
      ]
    case 'action_reports':
      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/actions/${actionId}/reports/${actionReportId}/values`,
          text: 'Values',
        },
      ]
    case 'place_reports':
      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${
            level === 2 ? `/places/${placeId2}` : ''
          }/reports/${placeReportId}/values`,
          text: 'Values',
        },
      ]
    case 'goals':
      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}/reports`,
          text: 'Reports',
        },
      ]
    case 'goal_reports':
      return [
        {
          path: `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}/reports/${goalReportId}/values`,
          text: 'Values',
        },
      ]
    case 'lists':
      return [
        {
          path: `/data/projects/${projectId}/lists/${listId}/values`,
          text: 'Values',
        },
      ]
    case 'vector_layers':
      return [
        {
          path: `/data/projects/${projectId}/vector-layers/${vectorLayerId}/vector-layer-displays`,
          text: 'Displays',
        },
      ]
    case 'taxonomies':
      return [
        {
          path: `/data/projects/${projectId}/taxonomies/${taxonomyId}/taxa`,
          text: 'Taxa',
        },
      ]
    case 'charts':
      return [
        {
          path: `${projectId ? `/data/projects/${projectId}` : ''}${
            subprojectId ? `/subprojects/${subprojectId}` : ''
          }${placeId ? `/places/${placeId}` : ''}${
            placeId2 ? `/places/${placeId2}` : ''
          }/charts/${chartId}/subjects`,
          text: 'Subjects',
        },
      ]
    default: {
      return null
    }
  }
}
