import { createFileRoute } from '@tanstack/react-router'import { createFileRoute } from '@tanstack/react-router'












})  }),    navDataFetcher: 'useWmsServiceLayerNavData',  beforeLoad: () => ({  component: WmsServiceLayer,)({  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/',export const Route = createFileRoute(import { WmsServiceLayer } from '../../../../../../formsAndLists/wmsServiceLayer/index.tsx'
export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/"!
    </div>
  )
}
