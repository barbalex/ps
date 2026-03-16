// This file has been manually updated to reflect the enum type
export type VectorLayerMarkerTypesMarkerType = 'circle' | 'marker'

/** Represents the table public.vector_layer_marker_types */
export default interface VectorLayerMarkerTypes {
  marker_type: VectorLayerMarkerTypesMarkerType

  sort: number | null

  created_at: Date

  updated_at: Date

  updated_by: string | null
}

/** Represents the initializer for the table public.vector_layer_marker_types */
export interface VectorLayerMarkerTypesInitializer {
  marker_type: VectorLayerMarkerTypesMarkerType

  sort?: number | null

  /** Default value: now() */
  created_at?: Date

  /** Default value: now() */
  updated_at?: Date

  updated_by?: string | null
}

/** Represents the mutator for the table public.vector_layer_marker_types */
export interface VectorLayerMarkerTypesMutator {
  marker_type?: VectorLayerMarkerTypesMarkerType

  sort?: number | null

  created_at?: Date

  updated_at?: Date

  updated_by?: string | null
}
