/**
 * Dialog that renders an entity form inside a secondary TanStack Router instance
 * backed by a memory history. This avoids opening a new browser tab (which causes
 * cross-tab PGlite SharedWorker communication problems) while still showing the
 * full interactive form without navigating away from the qcs-run page.
 *
 * All data-access contexts (PGliteProvider, JotaiProvider, IntlProvider) are
 * inherited from the outer application tree, so the form can read and write the
 * database exactly like it normally would.
 */
import { useMemo } from 'react'
import {
  createRouter,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import { useIntl } from 'react-intl'

import { Place } from '../../formsAndLists/place/index.tsx'
import { CheckIndex } from '../../formsAndLists/check/Index.tsx'
import { ActionIndex } from '../../formsAndLists/action/Index.tsx'
import { Goal } from '../../formsAndLists/goal/index.tsx'
import { Subproject } from '../../formsAndLists/subproject/index.tsx'
import { SubprojectReport } from '../../formsAndLists/subprojectReport/index.tsx'
import { SubprojectUser } from '../../formsAndLists/subprojectUser/index.tsx'
import { SubprojectTaxon } from '../../formsAndLists/subprojectTaxon/index.tsx'
import { Chart } from '../../formsAndLists/chart/index.tsx'
import { ChartSubject } from '../../formsAndLists/chartSubject/index.tsx'
import { SubprojectReportDesign } from '../../formsAndLists/subprojectReportDesign/index.tsx'
import { PlaceUser } from '../../formsAndLists/placeUser/index.tsx'

const {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  Button,
  Text,
} = fluentUiReactComponents

// ── Route path strings (must match the main app's createFileRoute paths exactly) ──

const PLACE =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place'
const CHECK =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check'
const ACTION =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action'
const GOAL =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal'
const SUBPROJECT =
  '/data/projects/$projectId_/subprojects/$subprojectId_/subproject'
const SUBPROJECT_REPORT =
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/'
const SUBPROJECT_USER =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'
const SUBPROJECT_TAXON =
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/'
const CHART =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart'
const CHART_SUBJECT =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/'
const SUBPROJECT_REPORT_DESIGN =
  '/data/projects/$projectId_/subproject-designs/$subprojectReportDesignId/'
const PLACE_USER =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/'

// ── Minimal route tree matching all QC SQL URL patterns ──
// Created at module level so the route objects are stable across renders.
//
// File-based TanStack Router sets route `id` WITH trailing underscores on param
// names (e.g. /$placeId_) for `useParams({ from })` lookup, but sets route
// `path` WITHOUT trailing underscores (e.g. /$placeId) for actual URL matching
// and param extraction.  Programmatic routes that use the underscore form for
// both id and path cause params to be extracted as `placeId_` rather than
// `placeId`, making all form useParams() calls return undefined.
//
// We replicate the file-based behaviour via .update(): pass the underscore path
// as the route `id` (so `from` lookup succeeds) and the underscore-stripped
// path as the route `path` (so params are extracted without underscores).

/** Strip trailing underscores from dynamic-param names in a TanStack Router path template. */
const stripParamUnderscores = (p: string) =>
  p.replace(/\$([a-zA-Z0-9]+)_(?=\/|$)/g, '$$$1')

const rootRoute = createRootRoute({ component: () => <Outlet /> })

/** Create a dialog route where id=pathWithUnderscores, path=pathWithoutUnderscores. */
const dr = (id: string, component: () => JSX.Element) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: id, // overridden by .update() below; just needs a non-empty value
    component,
  }).update({
    id,
    path: stripParamUnderscores(id),
    getParentRoute: () => rootRoute,
  } as unknown as Parameters<typeof createRoute>[0])

const routeTree = rootRoute.addChildren([
  dr(PLACE, () => <Place from={PLACE} />),
  dr(CHECK, () => <CheckIndex from={CHECK} />),
  dr(ACTION, () => <ActionIndex from={ACTION} />),
  dr(GOAL, () => <Goal from={GOAL} />),
  dr(SUBPROJECT, () => <Subproject from={SUBPROJECT} />),
  dr(SUBPROJECT_REPORT, () => <SubprojectReport from={SUBPROJECT_REPORT} />),
  dr(SUBPROJECT_USER, () => <SubprojectUser />),
  dr(SUBPROJECT_TAXON, () => <SubprojectTaxon from={SUBPROJECT_TAXON} />),
  dr(CHART, () => <Chart from={CHART} />),
  dr(CHART_SUBJECT, () => <ChartSubject />),
  dr(SUBPROJECT_REPORT_DESIGN, () => <SubprojectReportDesign />),
  dr(PLACE_USER, () => <PlaceUser from={PLACE_USER} />),
])

// ── Public interface ──

interface Props {
  /** Internal app URL of the entity to show, or null to hide the dialog. */
  url: string | null
  /** Entity label shown as the dialog title. */
  label: string | null
  onClose: () => void
  /** Called when the user asks to navigate away (e.g. from the not-found fallback). */
  onNavigate: (url: string) => void
}

export const QcsResultDialog = ({ url, label, onClose, onNavigate }: Props) => {
  const { formatMessage } = useIntl()

  const router = useMemo(() => {
    if (!url) return null

    // Capture `url` and `onNavigate` in a closure so the not-found fallback
    // can call back into the main router without prop drilling through
    // TanStack Router internals.
    const capturedUrl = url
    const NotFoundFallback = () => {
      const { formatMessage: fmt } = useIntl()
      return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text>
            {fmt({
              id: 'qcsResultDialog.notMapped',
              defaultMessage: 'Dieses Formular kann nicht im Dialog angezeigt werden.',
            })}
          </Text>
          <Button appearance="primary" onClick={() => onNavigate(capturedUrl)}>
            {fmt({
              id: 'qcsResultDialog.navigateTo',
              defaultMessage: 'Zum Formular navigieren',
            })}
          </Button>
        </div>
      )
    }

    const history = createMemoryHistory({ initialEntries: [url] })
    return createRouter({ routeTree, history, defaultNotFoundComponent: NotFoundFallback })
  }, [url, onNavigate])

  return (
    <Dialog
      open={!!url}
      onOpenChange={(_, data) => {
        if (!data.open) onClose()
      }}
    >
      <DialogSurface
        style={{
          width: '90vw',
          maxWidth: 1400,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'relative',
        }}
      >
        <DialogTrigger action="close" disableButtonEnhancement>
          <Button
            appearance="subtle"
            aria-label={formatMessage({
              id: 'qcsResultDialog.close',
              defaultMessage: 'Schliessen',
            })}
            icon={<Dismiss24Regular />}
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          />
        </DialogTrigger>
        <DialogBody
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <DialogTitle
            style={{ padding: '8px 16px', borderBottom: '1px solid var(--colorNeutralStroke2)', paddingRight: 48 }}
          >
            {label ?? ''}
          </DialogTitle>
          <DialogContent style={{ flex: 1, overflow: 'auto', padding: 0 }}>
            {router && <RouterProvider router={router} />}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

