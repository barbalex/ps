import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { useElectric } from '../../ElectricProvider'
import { Header } from './Header'
import { Main } from './Main'
import { Notifications } from '../Notifications'

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const { db } = useElectric()!
  useEffect(() => {
    const syncItems = async () => {
      console.log('hello Layout, syncItems 1, db:', db)
      // Resolves when the shape subscription has been established.
      // console.log('hello Layout, syncItems 1, db:', db)
      const { synced: usersSync } = await db.users.sync({
        include: {
          accounts: true,
          project_users: true,
          subproject_users: true,
          place_users: true,
          user_messages: true,
        },
      })
      // console.log('hello Layout, syncItems 2, usersSync:', usersSync)
      const { synced: accountsSync } = await db.accounts.sync({
        include: { users: true },
      })
      // console.log('hello Layout, syncItems 3, accountsSync:', accountsSync)
      const { synced: projectsSync } = await db.projects.sync({
        include: { accounts: true },
      })
      const { synced: placeLevelsSync } = await db.place_levels.sync({
        include: { accounts: true, projects: true },
      })
      const { synced: subprojectsSync } = await db.subprojects.sync({
        include: { accounts: true, projects: true },
      })
      const { synced: projectUsersSync } = await db.project_users.sync({
        include: { accounts: true, projects: true, users: true },
      })
      const { synced: subprojectUsersSync } = await db.subproject_users.sync({
        include: { accounts: true, subprojects: true, users: true },
      })
      const { synced: taxonomiesSync } = await db.taxonomies.sync({
        include: { accounts: true, projects: true }, // taxa?
      })
      const { synced: taxaSync } = await db.taxa.sync({
        include: { accounts: true, taxonomies: true },
      })
      const { synced: subprojectTaxaSync } = await db.subproject_taxa.sync({
        include: { accounts: true, subprojects: true, taxa: true },
      })
      const { synced: listsSync } = await db.lists.sync({
        include: { accounts: true, projects: true },
      })
      const { synced: listValuesSync } = await db.list_values.sync({
        include: { accounts: true, lists: true },
      })
      const { synced: unitsSync } = await db.units.sync({
        include: { accounts: true, projects: true, lists: true },
      })
      const { synced: placesSync } = await db.places.sync({
        include: { accounts: true, subprojects: true, places: true },
      })
      const { synced: actionsSync } = await db.actions.sync({
        include: { accounts: true, places: true },
      })
      const { synced: actionValuesSync } = await db.action_values.sync({
        include: { accounts: true, actions: true, units: true },
      })
      const { synced: actionReportsSync } = await db.action_reports.sync({
        include: { accounts: true, actions: true },
      })
      const { synced: actionReportValuesSync } =
        await db.action_report_values.sync({
          include: { accounts: true, action_reports: true, units: true },
        })
      const { synced: checksSync } = await db.checks.sync({
        include: { accounts: true, places: true },
      })
      const { synced: checkValuesSync } = await db.check_values.sync({
        include: { accounts: true, checks: true, units: true },
      })
      const { synced: checkTaxaSync } = await db.check_taxa.sync({
        include: { accounts: true, checks: true, taxa: true, units: true },
      })
      const { synced: placeReportsSync } = await db.place_reports.sync({
        include: { accounts: true, places: true },
      })
      const { synced: placeReportValuesSync } =
        await db.place_report_values.sync({
          include: { accounts: true, place_reports: true, units: true },
        })
      const { synced: observationSourcesSync } =
        await db.observation_sources.sync({
          include: { accounts: true, projects: true },
        })
      const { synced: observationsSync } = await db.observations.sync({
        include: { accounts: true, observation_sources: true, places: true },
      })
      const { synced: messagesSync } = await db.messages.sync()
      const { synced: userMessagesSync } = await db.user_messages.sync({
        include: { users: true, messages: true, accounts: true },
      })
      const { synced: placeUsersSync } = await db.place_users.sync({
        include: { accounts: true, places: true, users: true },
      })
      const { synced: goalsSync } = await db.goals.sync({
        include: { accounts: true, subprojects: true },
      })
      const { synced: goalReportsSync } = await db.goal_reports.sync({
        include: { accounts: true, goals: true },
      })
      const { synced: goalReportValuesSync } = await db.goal_report_values.sync(
        { include: { accounts: true, goal_reports: true, units: true } },
      )
      const { synced: subprojectReportsSync } =
        await db.subproject_reports.sync({
          include: { accounts: true, subprojects: true },
        })
      const { synced: projectReportsSync } = await db.project_reports.sync({
        include: { accounts: true, projects: true },
      })
      const { synced: filesSync } = await db.files.sync({
        include: {
          accounts: true,
          projects: true,
          subprojects: true,
          places: true,
          actions: true,
          checks: true,
        },
      })
      const { synced: personsSync } = await db.persons.sync({
        include: { projects: true, accounts: true },
      })
      const { synced: fieldTypesSync } = await db.field_types.sync()
      const { synced: widgetTypesSync } = await db.widget_types.sync()
      const { synced: widgetsForFieldsSync } = await db.widgets_for_fields.sync(
        { include: { field_types: true, widget_types: true } },
      )
      const { synced: fieldsSync } = await db.fields.sync({
        include: {
          projects: true,
          accounts: true,
          field_types: true,
          widget_types: true,
          lists: true,
        },
      })
      // const { synced: uiOptionsSync } = await db.ui_options.sync({
      //   include: { accounts: true },
      // })
      const { synced: gbifOccurrenceDownloadsSync } =
        await db.gbif_occurrence_downloads.sync({
          include: { accounts: true, projects: true, subprojects: true },
        })
      const { synced: gbifTaxaSync } = await db.gbif_taxa.sync({
        include: { accounts: true, projects: true },
      })
      const { synced: gbifOccurrencesSync } = await db.gbif_occurrences.sync({
        include: { accounts: true, projects: true, subprojects: true },
      })
      const { synced: tileLayersSync } = await db.tile_layers.sync({
        include: { projects: true, accounts: true },
      })
      const { synced: vectorLayersSync } = await db.vector_layers.sync({
        include: { projects: true, accounts: true },
      })
      const { synced: layerOptionsSync } = await db.layer_options.sync({
        include: { tile_layers: true, vector_layers: true, accounts: true },
      })
      const { synced: vectorLayerGeomsSync } = await db.vector_layer_geoms.sync(
        { include: { accounts: true, vector_layers: true } },
      )
      const { synced: vectorLayerDisplaysSync } =
        await db.vector_layer_displays.sync({
          include: { accounts: true, vector_layers: true },
        })
      const { synced: chartsSync } = await db.charts.sync({
        include: {
          accounts: true,
          projects: true,
          subprojects: true,
          places: true,
        },
      })
      const { synced: chartSubjectsSync } = await db.chart_subjects.sync({
        include: { accounts: true, charts: true, units: true },
      })
      // Resolves when the data has been synced into the local database.
      await usersSync
      await accountsSync
      await projectsSync
      await placeLevelsSync
      await subprojectsSync
      await projectUsersSync
      await subprojectUsersSync
      await taxonomiesSync
      await taxaSync
      await subprojectTaxaSync
      await listsSync
      await listValuesSync
      await unitsSync
      await placesSync
      await actionsSync
      await actionValuesSync
      await actionReportsSync
      await actionReportValuesSync
      await checksSync
      await checkValuesSync
      await checkTaxaSync
      await placeReportsSync
      await placeReportValuesSync
      await observationSourcesSync
      await observationsSync
      await messagesSync
      await userMessagesSync
      await placeUsersSync
      await goalsSync
      await goalReportsSync
      await goalReportValuesSync
      await subprojectReportsSync
      await projectReportsSync
      await filesSync
      await personsSync
      await fieldTypesSync
      await widgetTypesSync
      await widgetsForFieldsSync
      await fieldsSync
      // await uiOptionsSync
      await gbifOccurrenceDownloadsSync
      await gbifTaxaSync
      await gbifOccurrencesSync
      await tileLayersSync
      await vectorLayersSync
      await layerOptionsSync
      await vectorLayerGeomsSync
      await vectorLayerDisplaysSync
      await chartsSync
      await chartSubjectsSync
    }

    syncItems()
  }, [db])

  // console.log('Layout rendering')

  // this is used to show forms inside popups in the map
  if (onlyForm) {
    return <Main />
  }

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Navs />
      <Main />
      <Notifications />
    </>
  )
}
