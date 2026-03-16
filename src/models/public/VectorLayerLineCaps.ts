// This file has been manually updated to reflect the enum type
export type VectorLayerLineCapsLineCap = 'butt' | 'round' | 'square'

/** Represents the table public.vector_layer_line_caps */
export default interface VectorLayerLineCaps {
  line_cap: VectorLayerLineCapsLineCap

  sort: number | null

  created_at: Date

  updated_at: Date

  updated_by: string | null
}

/** Represents the initializer for the table public.vector_layer_line_caps */
export interface VectorLayerLineCapsInitializer {
  line_cap: VectorLayerLineCapsLineCap

  sort?: number | null

  /** Default value: now() */
  created_at?: Date

  /** Default value: now() */
  updated_at?: Date

  updated_by?: string | null
}

/** Represents the mutator for the table public.vector_layer_line_caps */
export interface VectorLayerLineCapsMutator {
  line_cap?: VectorLayerLineCapsLineCap

  sort?: number | null

  created_at?: Date

  updated_at?: Date

  updated_by?: string | null
}
