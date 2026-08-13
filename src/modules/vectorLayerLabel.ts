import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { getOwnLayerLabels } from './ownLayerLabels.ts'
import { languageAtom } from '../store.ts'
import type { Language } from '../store.ts'
import type VectorLayers from '../models/public/VectorLayers.ts'
import type PlaceLevels from '../models/public/PlaceLevels.ts'

// Own (places/actions/checks/observations) vector layers do not store a label —
// their display label is derived from the project's place_levels at render time.
// This replaces the old updateTableVectorLayerLabels.ts, which wrote the derived
// label back into vector_layers.label on every load (producing spurious pending
// operations). See plan: "vector_layers labels redesign".

const pluralName = (
  pl: PlaceLevels | undefined,
  language: Language,
): string | null | undefined => {
  if (!pl) return undefined
  switch (language) {
    case 'en':
      return pl.name_plural_en
    case 'fr':
      return pl.name_plural_fr
    case 'it':
      return pl.name_plural_it
    default:
      return pl.name_plural_de
  }
}

const singularName = (
  pl: PlaceLevels | undefined,
  language: Language,
): string | null | undefined => {
  if (!pl) return undefined
  switch (language) {
    case 'en':
      return pl.name_singular_en
    case 'fr':
      return pl.name_singular_fr
    case 'it':
      return pl.name_singular_it
    default:
      return pl.name_singular_de
  }
}

/** Display label for an own (places/actions/checks/observations) vector layer. */
export const getOwnVectorLayerLabel = (
  vectorLayer: Pick<VectorLayers, 'own_table' | 'own_table_level'>,
  language: Language,
  placeLevels: PlaceLevels[] | undefined,
): string => {
  const labels = getOwnLayerLabels(language)
  const placeLevel = placeLevels?.find(
    (pl) => pl.level == vectorLayer.own_table_level,
  )
  const singular = singularName(placeLevel, language)

  switch (vectorLayer.own_table) {
    case 'places':
      return pluralName(placeLevel, language) ?? labels.placesLabel
    case 'actions':
      return singular
        ? labels.actionsByPlaceLabel(singular)
        : labels.actionsLabel
    case 'checks':
      return singular ? labels.checksByPlaceLabel(singular) : labels.checksLabel
    case 'observations_assigned':
      return singular
        ? labels.observationsAssignedByPlaceLabel(singular)
        : labels.observationsAssignedLabel
    case 'observations_assigned_lines':
      return singular
        ? labels.observationsAssignedLinesLabel(singular)
        : labels.observationsAssignedLinesLabel(labels.placesLabel)
    case 'observations_to_assess':
      return labels.observationsToAssessLabel
    case 'observations_not_to_assign':
      return labels.observationsNotToAssignLabel
    default:
      return vectorLayer.own_table ?? ''
  }
}

/**
 * Unified display label for any vector layer.
 * - own layers: derived from place_levels + language
 * - wfs/upload: stored label_<language> with de fallback, then name, then id
 */
export const getVectorLayerLabel = (
  vectorLayer: VectorLayers | null | undefined,
  language: Language,
  placeLevels: PlaceLevels[] | undefined,
): string => {
  if (!vectorLayer) return ''
  if (vectorLayer.type === 'own') {
    return getOwnVectorLayerLabel(vectorLayer, language, placeLevels)
  }
  return (
    vectorLayer[`label_${language}`] ??
    vectorLayer.label_de ??
    vectorLayer.name ??
    vectorLayer.vector_layer_id
  )
}

/** Loads the place_levels for a project (single shared query for label lookup). */
export const usePlaceLevels = (projectId?: string): PlaceLevels[] => {
  const res = useLiveQuery(`SELECT * FROM place_levels WHERE project_id = $1`, [
    projectId,
  ])
  return res?.rows ?? []
}

/** Display label for a single vector layer, loading place_levels as needed. */
export const useVectorLayerLabel = (
  vectorLayer: VectorLayers | null | undefined,
  projectId?: string,
): string => {
  const [language] = useAtom(languageAtom)
  const placeLevels = usePlaceLevels(projectId)
  return getVectorLayerLabel(vectorLayer, language, placeLevels)
}

/** Map a list of vector layers to their display labels. */
export const useVectorLayerLabels = (
  vectorLayers: VectorLayers[],
  projectId?: string,
): string[] => {
  const [language] = useAtom(languageAtom)
  const placeLevels = usePlaceLevels(projectId)
  return useMemo(
    () =>
      vectorLayers.map((vl) => getVectorLayerLabel(vl, language, placeLevels)),
    [vectorLayers, language, placeLevels],
  )
}
