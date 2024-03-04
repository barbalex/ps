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
      // Resolves when the shape subscription has been established.
      const { synced: usersSync } = await db.users.sync()
      const { synced: accountsSync } = await db.accounts.sync()
      const { synced: projectsSync } = await db.projects.sync()
      const { synced: placeLevelsSync } = await db.place_levels.sync()
      const { synced: subprojectsSync } = await db.subprojects.sync()
      const { synced: projectUsersSync } = await db.project_users.sync()
      const { synced: subprojectUsersSync } = await db.subproject_users.sync()
      const { synced: taxonomiesSync } = await db.taxonomies.sync()
      const { synced: taxaSync } = await db.taxa.sync()
      const { synced: subprojectTaxaSync } = await db.subproject_taxa.sync()
      const { synced: listsSync } = await db.lists.sync()
      const { synced: listValuesSync } = await db.list_values.sync()
      const { synced: unitsSync } = await db.units.sync()
      const { synced: placesSync } = await db.places.sync()
      const { synced: actionsSync } = await db.actions.sync()
      const { synced: actionValuesSync } = await db.action_values.sync()
      const { synced: actionReportsSync } = await db.action_reports.sync()
      const { synced: actionReportValuesSync } =
        await db.action_report_values.sync()
      const { synced: checksSync } = await db.checks.sync()
      const { synced: checkValuesSync } = await db.check_values.sync()
      const { synced: checkTaxaSync } = await db.check_taxa.sync()
      const { synced: placeReportsSync } = await db.place_reports.sync()
      const { synced: placeReportValuesSync } =
        await db.place_report_values.sync()
      const { synced: observationSourcesSync } =
        await db.observation_sources.sync()
      const { synced: observationsSync } = await db.observations.sync()
      const { synced: messagesSync } = await db.messages.sync()
      const { synced: userMessagesSync } = await db.user_messages.sync()
      const { synced: placeUsersSync } = await db.place_users.sync()
      const { synced: goalsSync } = await db.goals.sync()
      const { synced: goalReportsSync } = await db.goal_reports.sync()
      const { synced: goalReportValuesSync } =
        await db.goal_report_values.sync()
      const { synced: subprojectReportsSync } =
        await db.subproject_reports.sync()
      const { synced: projectReportsSync } = await db.project_reports.sync()
      const { synced: filesSync } = await db.files.sync()
      const { synced: personsSync } = await db.persons.sync()
      const { synced: fieldTypesSync } = await db.field_types.sync()
      const { synced: widgetTypesSync } = await db.widget_types.sync()
      const { synced: widgetsForFieldsSync } =
        await db.widgets_for_fields.sync()
      const { synced: fieldsSync } = await db.fields.sync()

      const { synced: chartsSync } = await db.charts.sync()
      const { synced: chartSubjectsSync } = await db.chart_subjects.sync()

      // Resolves when the data has been synced into the local database.
      await usersSync
      await projectsSync
      await subprojectsSync
      await chartsSync
      await chartSubjectsSync
      await placesSync
      await checksSync
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
