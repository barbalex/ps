import { useEffect } from 'react'

import { useElectric } from '../ElectricProvider'

export const Syncer = () => {
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
        include: {
          users: true, // n-side
          projects: true, // 1-side
          place_levels: true, // 1-side
          subprojects: true, // 1-side
          project_users: true, // 1-side
          action_report_values: true, // 1-side
          actions: true, // 1-side
          action_values: true, // 1-side
          checks: true, // 1-side
          action_reports: true, // 1-side
          check_values: true, // 1-side
          check_taxa: true, // 1-side
          place_reports: true, // 1-side
          place_report_values: true, // 1-side
          observations: true, // 1-side
          observation_sources: true, // 1-side
          lists: true, // 1-side
          list_values: true, // 1-side
          chart_subjects: true, // 1-side
          charts: true, // 1-side
          files: true, // 1-side
          fields: true, // 1-side
          gbif_occurrence_downloads: true, // 1-side
          gbif_occurrences: true, // 1-side
          gbif_taxa: true, // 1-side
          goals: true, // 1-side
          goal_report_values: true, // 1-side
          goal_reports: true, // 1-side
          persons: true, // 1-side
          places: true, // 1-side
          project_reports: true, // 1-side
          layer_options: true, // 1-side
          tile_layers: true, // 1-side
          vector_layers: true, // 1-side
          vector_layer_geoms: true, // 1-side
          place_users: true, // 1-side
          subproject_reports: true, // 1-side
          subproject_taxa: true, // 1-side
          subproject_users: true, // 1-side
          taxa: true, // 1-side
          taxonomies: true, // 1-side
          ui_options: true, // 1-side
          units: true, // 1-side
          user_messages: true, // 1-side
          vector_layer_displays: true, // 1-side
        },
      })
      // console.log('hello Layout, syncItems 3, accountsSync:', accountsSync)
      const { synced: projectsSync } = await db.projects.sync({
        include: {
          accounts: true, // n-side
          project_users: true, // 1-side
          subprojects: true, // 1-side
          project_reports: true, // 1-side
          charts: true, // 1-side
          fields: true, // 1-side
          files: true, // 1-side
          persons: true, // 1-side
          place_levels: true, // 1-side
          gbif_occurrence_downloads: true, // 1-side
          gbif_taxa: true, // 1-side
          gbif_occurrences: true, // 1-side
          lists: true, // 1-side
          observation_sources: true, // 1-side
          taxonomies: true, // 1-side
          tile_layers: true, // 1-side
          vector_layers: true, // 1-side
        },
      })
      const { synced: placeLevelsSync } = await db.place_levels.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
        },
      })
      const { synced: subprojectsSync } = await db.subprojects.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          subproject_users: true, // 1-side
          subproject_reports: true, // 1-side
          charts: true, // 1-side
          files: true, // 1-side
          gbif_occurrence_downloads: true, // 1-side
          gbif_occurrences: true, // 1-side
          goals: true, // 1-side
          places: true, // 1-side
          subproject_taxa: true, // 1-side
        },
      })
      const { synced: projectUsersSync } = await db.project_users.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          users: true, // n-side
        },
      })
      const { synced: subprojectUsersSync } = await db.subproject_users.sync({
        include: {
          accounts: true, // n-side
          subprojects: true, // n-side
          users: true, // n-side
        },
      })
      const { synced: taxonomiesSync } = await db.taxonomies.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          taxa: true, // 1-side
        },
      })
      const { synced: taxaSync } = await db.taxa.sync({
        include: {
          accounts: true, // n-side
          taxonomies: true, // n-side
          subproject_taxa: true, // 1-side
          check_taxa: true, // 1-side
        },
      })
      const { synced: subprojectTaxaSync } = await db.subproject_taxa.sync({
        include: {
          accounts: true, // n-side
          subprojects: true, // n-side
          taxa: true, // n-side
        },
      })
      const { synced: listsSync } = await db.lists.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          fields: true, // 1-side
          list_values: true, // 1-side
          units: true, // 1-side
        },
      })
      const { synced: listValuesSync } = await db.list_values.sync({
        include: {
          accounts: true, // n-side
          lists: true, // n-side
        },
      })
      const { synced: unitsSync } = await db.units.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          lists: true, // n-side
          action_values: true, // 1-side
          action_report_values: true, // 1-side
          check_values: true, // 1-side
          place_report_values: true, // 1-side
        },
      })
      const { synced: placesSync } = await db.places.sync({
        include: {
          accounts: true, // n-side
          subprojects: true, // n-side
          places: true, // n-side
          place_reports: true, // 1-side
          place_users: true, // 1-side
          observations: true, // 1-side
          actions: true, // 1-side
          checks: true, // 1-side
          charts: true, // 1-side
          files: true, // 1-side
          other_places: true, // 1-side
        },
      })
      const { synced: actionsSync } = await db.actions.sync({
        include: {
          accounts: true, // n-side
          places: true, // n-side
          action_values: true, // 1-side
          action_reports: true, // 1-side
          files: true, // 1-side
        },
      })
      const { synced: actionValuesSync } = await db.action_values.sync({
        include: {
          accounts: true, // n-side
          actions: true, // n-side
          units: true, // n-side
        },
      })
      const { synced: actionReportsSync } = await db.action_reports.sync({
        include: {
          accounts: true, // n-side
          actions: true, // n-side
          action_report_values: true, // 1-side
        },
      })
      const { synced: actionReportValuesSync } =
        await db.action_report_values.sync({
          include: {
            accounts: true, // n-side
            action_reports: true, // n-side
            units: true, // n-side
          },
        })
      const { synced: checksSync } = await db.checks.sync({
        include: {
          accounts: true, // n-side
          places: true, // n-side
          check_values: true, // 1-side
          check_taxa: true, // 1-side
          files: true, // 1-side
        },
      })
      const { synced: checkValuesSync } = await db.check_values.sync({
        include: {
          accounts: true, // n-side
          checks: true, // n-side
          units: true, // n-side
        },
      })
      const { synced: checkTaxaSync } = await db.check_taxa.sync({
        include: {
          accounts: true, // n-side
          checks: true, // n-side
          taxa: true, // n-side
          units: true, // n-side
        },
      })
      const { synced: placeReportsSync } = await db.place_reports.sync({
        include: {
          accounts: true, // n-side
          places: true, // n-side
          place_report_values: true, // 1-side
        },
      })
      const { synced: placeReportValuesSync } =
        await db.place_report_values.sync({
          include: {
            accounts: true, // n-side
            place_reports: true, // n-side
            units: true, // n-side
          },
        })
      const { synced: observationSourcesSync } =
        await db.observation_sources.sync({
          include: {
            accounts: true, // n-side
            projects: true, // n-side
            observations: true, // 1-side,
          },
        })
      const { synced: observationsSync } = await db.observations.sync({
        include: {
          accounts: true, // n-side
          observation_sources: true, // n-side
          places: true, // n-side
        },
      })
      const { synced: messagesSync } = await db.messages.sync({
        include: {
          user_messages: true, // 1-side
        },
      })
      const { synced: userMessagesSync } = await db.user_messages.sync({
        include: {
          users: true, // n-side
          messages: true, // n-side
          accounts: true, // n-side
        },
      })
      const { synced: placeUsersSync } = await db.place_users.sync({
        include: {
          accounts: true, // n-side
          places: true, // n-side
          users: true, // n-side
        },
      })
      const { synced: goalsSync } = await db.goals.sync({
        include: {
          accounts: true, // n-side
          subprojects: true, // n-side
          goal_reports: true, // 1-side
        },
      })
      const { synced: goalReportsSync } = await db.goal_reports.sync({
        include: {
          accounts: true, // n-side
          goals: true, // n-side
          goal_report_values: true, // 1-side
        },
      })
      const { synced: goalReportValuesSync } = await db.goal_report_values.sync(
        {
          include: {
            accounts: true, // n-side
            goal_reports: true, // n-side
            units: true, // n-side
          },
        },
      )
      const { synced: subprojectReportsSync } =
        await db.subproject_reports.sync({
          include: {
            accounts: true, // n-side
            subprojects: true, // n-side
          },
        })
      const { synced: projectReportsSync } = await db.project_reports.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
        },
      })
      const { synced: filesSync } = await db.files.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          subprojects: true, // n-side
          places: true, // n-side
          actions: true, // n-side
          checks: true, // n-side
        },
      })
      const { synced: personsSync } = await db.persons.sync({
        include: {
          projects: true, // n-side
          accounts: true, // n-side
        },
      })
      const { synced: fieldTypesSync } = await db.field_types.sync({
        include: {
          fields: true, // 1-side
          widgets_for_fields: true, // 1-side
        },
      })
      const { synced: widgetTypesSync } = await db.widget_types.sync({
        include: {
          widgets_for_fields: true, // 1-side
          fields: true, // 1-side
        },
      })
      const { synced: widgetsForFieldsSync } = await db.widgets_for_fields.sync(
        {
          include: {
            field_types: true, // n-side
            widget_types: true, // n-side
          },
        },
      )
      const { synced: fieldsSync } = await db.fields.sync({
        include: {
          projects: true, // n-side
          accounts: true, // n-side
          field_types: true, // n-side
          widget_types: true, // n-side
          lists: true, // n-side
        },
      })
      const { synced: uiOptionsSync } = await db.ui_options.sync({
        include: {
          accounts: true, // n-side
        },
      })
      const { synced: gbifOccurrenceDownloadsSync } =
        await db.gbif_occurrence_downloads.sync({
          include: {
            accounts: true, // n-side
            projects: true, // n-side
            subprojects: true, // n-side
          },
        })
      const { synced: gbifTaxaSync } = await db.gbif_taxa.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
        },
      })
      const { synced: gbifOccurrencesSync } = await db.gbif_occurrences.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          subprojects: true, // n-side
        },
      })
      const { synced: tileLayersSync } = await db.tile_layers.sync({
        include: {
          projects: true, // n-side
          accounts: true, // n-side
          layer_options: true, // 1-side
        },
      })
      const { synced: vectorLayersSync } = await db.vector_layers.sync({
        include: {
          projects: true, // n-side
          accounts: true, // n-side
          layer_options: true, // 1-side
          vector_layer_displays: true, // 1-side
          vector_layer_geoms: true, // 1-side
        },
      })
      const { synced: layerOptionsSync } = await db.layer_options.sync({
        include: {
          tile_layers: true, // n-side
          vector_layers: true, // n-side
          accounts: true, // n-side
        },
      })
      const { synced: vectorLayerGeomsSync } = await db.vector_layer_geoms.sync(
        {
          include: {
            accounts: true, // n-side
            vector_layers: true, // n-side
          },
        },
      )
      const { synced: vectorLayerDisplaysSync } =
        await db.vector_layer_displays.sync({
          include: {
            accounts: true, // n-side
            vector_layers: true, // n-side
          },
        })
      const { synced: chartsSync } = await db.charts.sync({
        include: {
          accounts: true, // n-side
          projects: true, // n-side
          subprojects: true, // n-side
          places: true, // n-side
          chart_subjects: true, // 1-side
        },
      })
      const { synced: chartSubjectsSync } = await db.chart_subjects.sync({
        include: {
          accounts: true, // n-side
          charts: true, // n-side
          units: true, // n-side
        },
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
      await uiOptionsSync
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

  return null
}
