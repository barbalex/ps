import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/"!
    </div>
  )
}
