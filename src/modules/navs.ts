import { user_id } from '../components/SqlInitializer'

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
  observation_source_id,
  db,
  level = 1,
}) => {
  const uiOptions = await db?.ui_options?.findUnique({
    where: { user_id },
  })
  const designing = uiOptions?.designing ?? false
  // if table is places, get place_level for this level
  let placeLevel = {}
  if (table === 'places') {
    // findUnique only works for primary keys
    const placeLevels = await db?.place_levels?.findMany({
      where: { project_id, deleted: false, level },
    })
    placeLevel = placeLevels?.[0] ?? {}
  }

  switch (table) {
    case 'root':
      return [
        { path: '/projects', text: 'Projects' },
        { path: '/users', text: 'Users' },
        { path: '/accounts', text: 'Accounts' },
        ...(designing
          ? [
              { path: '/field-types', text: 'Field Types' },
              { path: '/widget-types', text: 'Widget Types' },
              { path: '/widgets-for-fields', text: 'Widgets For Fields' },
              { path: '/fields', text: 'Fields' },
            ]
          : []),
        { path: '/files', text: 'Files' },
        { path: '/messages', text: 'Messages' },
        { path: '/docs', text: 'Docs' },
      ]
      break
    case `projects`: {
      // fetch projects.subproject_name_plural to name subprojects
      const project = await db?.projects?.findUnique({
        where: { project_id },
      })
      const subprojectName = project?.subproject_name_plural ?? 'Subprojects'

      return [
        {
          path: `/projects/${project_id}/subprojects`,
          text: subprojectName,
        },
        {
          path: `/projects/${project_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/projects/${project_id}/persons`,
          text: 'Persons',
        },
        { path: `/projects/${project_id}/tile-layers`, text: 'Tile Layers' },
        {
          path: `/projects/${project_id}/vector-layers`,
          text: 'Vector Layers',
        },
        {
          path: `/projects/${project_id}/files`,
          text: 'Files',
        },
        ...(designing
          ? [
              { path: `/projects/${project_id}/users`, text: 'Users' },
              { path: `/projects/${project_id}/lists`, text: 'Lists' },
              {
                path: `/projects/${project_id}/taxonomies`,
                text: 'Taxonomies',
              },
              { path: `/projects/${project_id}/units`, text: 'Units' },
              {
                path: `/projects/${project_id}/place-levels`,
                text: 'Place Levels',
              },
              { path: `/projects/${project_id}/fields`, text: 'Fields' },
              {
                path: `/projects/${project_id}/observation-sources`,
                text: 'Observation Sources',
              },
            ]
          : []),
      ]
    }
    case 'subprojects': {
      // need to fetch how places are named
      const placeLevels = await db?.place_levels?.findMany({
        where: { project_id, deleted: false, level: 1 },
      })
      const placeLevel = placeLevels?.[0]
      const placeName =
        placeLevel?.name_plural ?? placeLevel?.name_short ?? 'Places'

      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places`,
          text: placeName,
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/reports`,
          text: 'Reports',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/goals`,
          text: 'Goals',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/taxa`,
          text: 'Taxa',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/users`,
          text: 'Users',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/files`,
          text: 'Files',
        },
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
        const placeLevels = await db?.place_levels?.findMany({
          where: { project_id, deleted: false, level: 2 },
        })
        const placeLevel2 = placeLevels?.[0]
        placeName =
          placeLevel2?.name_plural ?? placeLevel2?.name_short ?? 'Places'
      }

      return [
        ...(needToIncludeLevel2
          ? [
              {
                path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/places`,
                text: placeName,
              },
            ]
          : []),
        ...(placeLevel.checks
          ? [
              {
                path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                  level === 2 ? `/places/${place_id2}` : ''
                }/checks`,
                text: 'Checks',
              },
            ]
          : []),
        ...(placeLevel.actions
          ? [
              {
                path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                  level === 2 ? `/places/${place_id2}` : ''
                }/actions`,
                text: 'Actions',
              },
            ]
          : []),
        ...(placeLevel.reports
          ? [
              {
                path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                  level === 2 ? `/places/${place_id2}` : ''
                }/reports`,
                text: 'Reports',
              },
            ]
          : []),
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/users`,
          text: 'Users',
        },
      ]
    }
    case 'checks': {
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/checks/${check_id}/values`,
          text: 'Values',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/checks/${check_id}/taxa`,
          text: 'Taxa',
        },
      ]
    }
    case 'actions':
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/values`,
          text: 'Values',
        },
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/reports`,
          text: 'Reports',
        },
      ]
    case 'action_reports':
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/actions/${action_id}/reports/${action_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'place_reports':
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
            level === 2 ? `/places/${place_id2}` : ''
          }/reports/${place_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'goals':
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
          text: 'Reports',
        },
      ]
    case 'goal_reports':
      return [
        {
          path: `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`,
          text: 'Values',
        },
      ]
    case 'lists':
      return [
        {
          path: `/projects/${project_id}/lists/${list_id}/values`,
          text: 'Values',
        },
      ]
    case 'vector_layers':
      return [
        {
          path: `/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays`,
          text: 'Displays',
        },
      ]
    case 'taxonomies':
      return [
        {
          path: `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`,
          text: 'Taxa',
        },
      ]
    case 'observation_sources':
      return [
        {
          path: `/projects/${project_id}/observation-sources/${observation_source_id}/observations`,
          text: 'Observations',
        },
      ]
    default: {
      return null
    }
  }
}
