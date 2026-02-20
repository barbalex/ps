import { createStore, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { constants } from "./modules/constants.ts";
import { uuidv7 } from "@kripod/uuidv7";
// import { atom } from 'jotai'

export const store = createStore();

function atomWithToggleAndStorage(key, initialValue, storage) {
  const anAtom = atomWithStorage(key, initialValue, storage);
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue) => {
      const update = nextValue ?? !get(anAtom);
      set(anAtom, update);
    },
  );

  return derivedAtom;
}

// nav stuff

export const enforceDesktopNavigationAtom = atomWithStorage(
  "enforceDesktopNavigation",
  false,
);
export const writeEnforceDesktopNavigationAtom = atom(
  (get) => get(enforceDesktopNavigationAtom),
  (get, set, enforce) => {
    if (enforce) {
      set(enforceDesktopNavigationAtom, true);
      set(enforceMobileNavigationAtom, false);
      set(isDesktopViewAtom, true);
      return;
    }
    set(enforceDesktopNavigationAtom, false);
    const isNowDesktopView = window.innerWidth >= constants.mobileViewMaxWidth;
    set(isDesktopViewAtom, isNowDesktopView);
    return;
  },
);
export const enforceMobileNavigationAtom = atomWithStorage(
  "enforceMobileNavigation",
  false,
);
export const writeEnforceMobileNavigationAtom = atom(
  (get) => get(enforceMobileNavigationAtom),
  (get, set, enforce) => {
    if (enforce) {
      set(enforceMobileNavigationAtom, true);
      set(enforceDesktopNavigationAtom, false);
      set(isDesktopViewAtom, false);
      return;
    }
    set(enforceMobileNavigationAtom, false);
    const isNowDesktopView = window.innerWidth >= constants.mobileViewMaxWidth;
    set(isDesktopViewAtom, isNowDesktopView);
    return;
  },
);
export const isDesktopViewAtom = atomWithStorage("isDesktopView", false);
export const setDesktopViewAtom = atom(
  (get) => get(isDesktopViewAtom),
  (get, set, width) => {
    const isDesktopView = get(isDesktopViewAtom);
    const mobileEnforced = get(enforceMobileNavigationAtom);
    const desktopEnforced = get(enforceDesktopNavigationAtom);
    if (mobileEnforced) {
      if (isDesktopView) set(isDesktopViewAtom, false);
      return;
    }
    if (desktopEnforced) {
      if (!isDesktopView) set(isDesktopViewAtom, true);
      return;
    }
    const isNowDesktopView = width >= constants.mobileViewMaxWidth;
    if (isNowDesktopView === isDesktopView) return;
    set(isDesktopViewAtom, isNowDesktopView);
  },
);

export const isMobileViewAtom = atom(
  (get) => !get(isDesktopViewAtom) || get(enforceMobileNavigationAtom),
);
export const hideBookmarksAtom = atom((get) => {
  const isDesktopView = get(isDesktopViewAtom);
  const enforceMobileNavigation = get(enforceMobileNavigationAtom);
  const hideBookmarks = isDesktopView && !enforceMobileNavigation;
  return hideBookmarks;
});
export const showBookmarksMenuAtom = atomWithStorage(
  "showBookmarksMenu",
  false,
);
export const alwaysShowTreeAtom = atomWithStorage("alwaysShowTree", false);
export const hideTreeAtom = atom((get) => {
  const alwaysShowTree = get(alwaysShowTreeAtom);
  const isMobileView = get(isMobileViewAtom);
  const hideTree = !alwaysShowTree && isMobileView;
  return hideTree;
});
export const showTreeMenusAtom = atom((get) => {
  // always show tree menus on desktop
  const isDesktopView = get(isDesktopViewAtom);
  // always show tree menus on mobile if alwaysShowTree is set
  const alwaysShowTree = get(alwaysShowTreeAtom);
  // always show tree menus if context menus are hidden i.e. on coarse pointer devices. NOPE
  // const contextMenusAreHidden = matchMedia('(pointer: coarse)').matches
  const showTreeMenus = isDesktopView || alwaysShowTree;

  return showTreeMenus;
});

// TODO: check what this is good / used for. Seems no use now
export const userIdAtom = atomWithStorage("userIdAtom", null);
export const userEmailAtom = atomWithStorage("userEmailAtom", null);
export const designingAtom = atomWithStorage("designingAtom", false);
export const tabsAtom = atomWithStorage("tabsAtom", ["tree", "data"]);

// initialSyncing happens on first app load
// on first app load liveQueries should not run yet, before initial sync is done
// on later app loads, data exists locally, so liveQueries can run immediately
// thus use an atom with storage
export const initialSyncingAtom = atomWithStorage("initialSyncingAtom", true);
// begins true, is set to false after initialization (or it's not needed)
export const sqlInitializingAtom = atomWithStorage("sqlInitializingAtom", true);

export const seenWmsServiceKeysAtom = atomWithStorage<string[]>(
  "seenWmsServiceKeysAtom",
  [],
);
export const seenWfsServiceKeysAtom = atomWithStorage<string[]>(
  "seenWfsServiceKeysAtom",
  [],
);

export const setSqlInitializingFalseAfterTimeoutAtom = atom(
  null,
  (get, set) => {
    setTimeout(() => {
      set(sqlInitializingAtom, false);
    }, 200);
  },
);

export const mapMaximizedAtom = atomWithStorage("mapMaximizedAtom", false);
// bounds are used for setting the map view to a specific area. They are set as an object with keys: swLat, swLng, neLat, neLng
// This is a command atom - not persisted because once fitBounds is applied, the result is saved via mapCenterAtom/mapZoomAtom
export const mapBoundsAtom = atom(null);
// is used for:
// - Making WFS requests with bbox parameters to fetch features within the visible map area
// - Any spatial queries that need to know what's currently visible
export const mapViewportBoundsAtom = atom(null);
// center and zoom are used to set the map view to a specific center and zoom level. They are set as [lat, lng] and number respectively
export const mapCenterAtom = atomWithStorage("mapCenter", [47.4, 8.65]);
export const mapZoomAtom = atomWithStorage("mapZoom", 13);

// map of id (layer.id, key) and show boolean
export const showLocalMapAtom = atomWithStorage("showLocalMapAtom", false);
export const localMapValuesAtom = atomWithStorage("localMapValuesAtom", {});
export const mapHideUiAtom = atomWithStorage("mapHideUiAtom", false);
export const mapLocateAtom = atomWithStorage("mapLocateAtom", false);
// TODO:
// new structure for map_info
// Goal: enable setting from onEachFeature for wfs layers and maybe own layers
// SINGLE object with keys:
// - lat
// - lng
// - zoom
// - layers. This is an array of objects with keys: label, properties
// With this structure, wms and wfs can set their layer data into such an object, then add the object to the existing in mapInfoAtom
// mapInfoAtom is reset when user closes info window, so memory is not wasted
// the info drawer filters all the objects with correct lat, lng and zoom and shows them
// Information presented, when user clicks on a map. Array of: {label, properties} where properties is an array of [key, value]
export const mapInfoAtom = atomWithStorage("mapInfoAtom", null);
export const mapShowCenterAtom = atomWithStorage("mapShowCenterAtom", false);
// The order of layers in the map. An array of layer_presentation_ids
export const mapLayerSortingAtom = atomWithStorage("mapLayerSortingAtom", []);
export const mapDrawerVectorLayerDisplayAtom = atomWithStorage(
  "mapDrawerVectorLayerDisplayAtom",
  null,
);

// The id of the place whose geometry is currently being edited
export const editingPlaceGeometryAtom = atomWithStorage(
  "editingPlaceGeometryAtom",
  false,
);
// The id of the check whose geometry is currently being edited
export const editingCheckGeometryAtom = atomWithStorage(
  "editingCheckGeometryAtom",
  false,
);
// The id of the action whose geometry is currently being edited
export const editingActionGeometryAtom = atomWithStorage(
  "editingActionGeometryAtom",
  false,
);
// The layers that are currently draggable. Any of: occurrences-to-assess, occurrences-not-to-assign, occurrences-assigned-1, occurrences-assigned-2
export const draggableLayersAtom = atomWithStorage("draggableLayersAtom", []);
// The layers that are currently droppable (any of: places-1, places-2). Array of layer names in the same format as draggableLayersAtom
export const droppableLayersAtom = atomWithStorage("droppableLayersAtom", []);
// Whether to show a dialog to confirm assigning an occurrence to a single target. Preset: true
export const confirmAssigningToSingleTargetAtom = atomWithStorage(
  "confirmAssigningToSingleTargetAtom",
  true,
);
// If multiple places are close to the dropped location, the user can choose one of them. This state opens a dialog. Field contains: Object with: occurrence_id, latLng (where marker was dropped, used only for finding nearby places), places (array with: place_id, label, distance), current_place_id (the occurrence's current assignment, if any)
export const placesToAssignOccurrenceToAtom = atomWithStorage(
  "placesToAssignOccurrenceToAtom",
  null,
);
// The order of fields in the occurrence form. User can change it by drag and drop
export const occurrenceFieldsSortedAtom = atomWithStorage(
  "occurrenceFieldsSortedAtom",
  [],
);
export const treeOpenNodesAtom = atomWithStorage("treeOpenNodesAtom", []);
// table filters
// Using array of or-filters
// Of objects with keys and value. why? because needs to be shown in the forms
// key is path i.e. jsonb is: data.key
export const projectsFilterAtom = atomWithStorage<Record<string, unknown>[]>(
  "projectsFilterAtom",
  [],
);
export const fieldsFilterAtom = atomWithStorage("fieldsFilterAtom", []);
export const fieldTypesFilterAtom = atomWithStorage("fieldTypesFilterAtom", []);
export const accountsFilterAtom = atomWithStorage("accountsFilterAtom", []);
export const crsFilterAtom = atomWithStorage("crsFilterAtom", []);
export const widgetTypesFilterAtom = atomWithStorage(
  "widgetTypesFilterAtom",
  [],
);
export const widgetsForFieldsFilterAtom = atomWithStorage(
  "widgetsForFieldsFilterAtom",
  [],
);
export const projectReportsFilterAtom = atomWithStorage(
  "projectReportsFilterAtom",
  [],
);
export const projectUsersFilterAtom = atomWithStorage(
  "projectUsersFilterAtom",
  [],
);
export const personsFilterAtom = atomWithStorage("personsFilterAtom", []);
export const wmsLayersFilterAtom = atomWithStorage("wmsLayersFilterAtom", []);
export const wmsServicesFilterAtom = atomWithStorage(
  "wmsServicesFilterAtom",
  [],
);
export const wfsServicesFilterAtom = atomWithStorage(
  "wfsServicesFilterAtom",
  [],
);
export const vectorLayersFilterAtom = atomWithStorage(
  "vectorLayersFilterAtom",
  [],
);
export const listsFilterAtom = atomWithStorage("listsFilterAtom", []);
export const taxonomiesFilterAtom = atomWithStorage("taxonomiesFilterAtom", []);
export const unitsFilterAtom = atomWithStorage("unitsFilterAtom", []);
export const subprojectsFilterAtom = atomWithStorage(
  "subprojectsFilterAtom",
  [],
);
export const subprojectReportsFilterAtom = atomWithStorage(
  "subprojectReportsFilterAtom",
  [],
);
export const subprojectUsersFilterAtom = atomWithStorage(
  "subprojectUsersFilterAtom",
  [],
);
export const chartsFilterAtom = atomWithStorage("chartsFilterAtom", []);
export const occurrenceImportsFilterAtom = atomWithStorage(
  "occurrenceImportsFilterAtom",
  [],
);
export const occurrencesToAssessFilterAtom = atomWithStorage(
  "occurrencesToAssessFilterAtom",
  [],
);
export const occurrencesNotToAssignFilterAtom = atomWithStorage(
  "occurrencesNotToAssignFilterAtom",
  [],
);
export const goalsFilterAtom = atomWithStorage("goalsFilterAtom", []);
export const usersFilterAtom = atomWithStorage("usersFilterAtom", []);
export const places1FilterAtom = atomWithStorage("places1FilterAtom", []);
export const places2FilterAtom = atomWithStorage("places2FilterAtom", []);
export const checks1FilterAtom = atomWithStorage("checks1FilterAtom", []);
export const checks2FilterAtom = atomWithStorage("checks2FilterAtom", []);
export const placeUsers1FilterAtom = atomWithStorage(
  "placeUsers1FilterAtom",
  [],
);
export const placeUsers2FilterAtom = atomWithStorage(
  "placeUsers2FilterAtom",
  [],
);
export const actions1FilterAtom = atomWithStorage("actions1FilterAtom", []);
export const actions2FilterAtom = atomWithStorage("actions2FilterAtom", []);
export const placeReports1FilterAtom = atomWithStorage(
  "placeReports1FilterAtom",
  [],
);
export const placeReports2FilterAtom = atomWithStorage(
  "placeReports2FilterAtom",
  [],
);
// TODO: add
export const filesFilterAtom = atomWithStorage("filesFilterAtom", []);
// TODO: add more filters
// filter_vector_layer_displays
// filter_subproject_chart_subjects
// filter_place_check_taxa_1
// filter_place_users_1
// filter_place_charts_1
// filter_place_chart_subjects_1
// filter_check_values_1
// filter_check_values_2
// filter_place_check_taxa_2
// filter_place_users_2
// filter_place_charts_2
// filter_place_chart_subjects_2

export const filterAtoms = {
  projects: projectsFilterAtom,
  fields: fieldsFilterAtom,
  fieldTypes: fieldTypesFilterAtom,
  accounts: accountsFilterAtom,
  crs: crsFilterAtom,
  widgetTypes: widgetTypesFilterAtom,
  widgetsForFields: widgetsForFieldsFilterAtom,
  projectReports: projectReportsFilterAtom,
  projectUsers: projectUsersFilterAtom,
  persons: personsFilterAtom,
  wmsLayers: wmsLayersFilterAtom,
  wmsServices: wmsServicesFilterAtom,
  wfsServices: wfsServicesFilterAtom,
  vectorLayers: vectorLayersFilterAtom,
  lists: listsFilterAtom,
  taxonomies: taxonomiesFilterAtom,
  units: unitsFilterAtom,
  subprojects: subprojectsFilterAtom,
  subprojectReports: subprojectReportsFilterAtom,
  subprojectUsers: subprojectUsersFilterAtom,
  charts: chartsFilterAtom,
  occurrenceImports: occurrenceImportsFilterAtom,
  occurrencesToAssess: occurrencesToAssessFilterAtom,
  occurrencesNotToAssign: occurrencesNotToAssignFilterAtom,
  goals: goalsFilterAtom,
  users: usersFilterAtom,
  places1: places1FilterAtom,
  places2: places2FilterAtom,
  checks1: checks1FilterAtom,
  checks2: checks2FilterAtom,
  placeUsers1: placeUsers1FilterAtom,
  placeUsers2: placeUsers2FilterAtom,
  actions1: actions1FilterAtom,
  actions2: actions2FilterAtom,
  placeReports1: placeReports1FilterAtom,
  placeReports2: placeReports2FilterAtom,
  files: filesFilterAtom,
};

// postgrestClient
export const postgrestClientAtom = atom(null);

// an array of objects with keys:
// - id: set by addOperationAtom
// - time: set by addOperationAtom
// - table
// - rowIdName
// - rowId
// - operation (update, insert, insertMany, delete, deleteAll)
// - filter
// - draft: object with key-value pairs for the operation
// - prev: object with key-value pairs of previous value for reverting the operation
export const operationsQueueAtom = atomWithStorage("operationsQueueAtom", []);
export const addOperationAtom = atom(
  (get) => null,
  (get, set, opDraft) => {
    const opQueue = get(operationsQueueAtom);
    const operation = {
      id: uuidv7(),
      time: new Date().toISOString(),
      ...opDraft,
    };
    // console.log('store.addOperationAtom, operation:', operation)
    set(operationsQueueAtom, [operation, ...opQueue]);
  },
);
export const removeOperationAtom = atom(
  (get) => null,
  (get, set, id) => {
    const opQueue = get(operationsQueueAtom);
    set(
      operationsQueueAtom,
      opQueue.filter((op) => op.id !== id),
    );
  },
);

export const onlineAtom = atom(true);
export const shortTermOnlineAtom = atom(true);

export const pgliteDbAtom = atom(null);

// an array of objects with keys:
// - id
// - time
// - title
// - message
// - info
// - type ('success', 'warning', 'info', 'error')
// - duration
// - dismissible?
// - allDismissible?
// - actionLabel?
// - actionName?
// - actionArgument?
export const notificationsAtom = atom([]);
export const updateNotificationAtom = atom(
  (get) => null,
  (get, set, { id, draft }) => {
    const notifications = get(notificationsAtom);
    const notification = notifications.splice(
      notifications.findIndex((n) => n.id === id),
      1,
    )[0];
    if (!notification) return;
    const updatedNotification = {
      ...notification,
      ...draft,
    };
    set(notificationsAtom, [updatedNotification, ...notifications]);
  },
);
export const removeNotificationAtom = atom(
  (get) => null,
  (get, set, id) => {
    const notifications = get(notificationsAtom);
    set(
      notificationsAtom,
      notifications.filter((n) => n.id !== id),
    );
  },
);
export const addNotificationAtom = atom(
  (get) => null,
  (get, set, draft) => {
    const notifications = get(notificationsAtom);
    const removeNotification = get(removeNotificationAtom);
    // do not stack same messages
    const notificationsWithSameMessage = notifications.filter(
      (n) => n.body !== undefined && n.body === draft.body,
    );
    if (notificationsWithSameMessage.length > 0) {
      return console.log(
        "Notification with same body already exists, not adding another.",
      );
    }

    const id = draft.id ?? uuidv7();
    const notification = {
      // set default values
      id,
      time: Date.now(),
      duration: 10000, // standard value: 10000
      intent: "info", // 'success' | 'error' | 'warning' | 'info'
      dismissable: true,
      allDismissable: true,
      title: undefined,
      body: undefined,
      // paused: If true, the notification is not dismissed according to timeout. Instead, it is dismissed when pause is updated to false. A spinner is shown.
      paused: undefined,
      // Progress of a long running task in %. Only passed, if progress can be measured. A progress bar is shown.
      progress: undefined,
      // overwrite with passed in ones:
      ...draft,
    };
    set(notificationsAtom, [notification, ...notifications]);
    // remove after duration
    setTimeout(() => set(removeNotificationAtom, id), notification.duration);

    return notification.id;
  },
);
