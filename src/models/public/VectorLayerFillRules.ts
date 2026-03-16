// This file has been manually updated to reflect the enum type
export type VectorLayerFillRulesFillRule = 'nonzero' | 'evenodd'

/** Represents the table public.vector_layer_fill_rules */
export default interface VectorLayerFillRules {
  fill_rule: VectorLayerFillRulesFillRule

  sort: number | null

  created_at: Date

  updated_at: Date

  updated_by: string | null
}

/** Represents the initializer for the table public.vector_layer_fill_rules */
export interface VectorLayerFillRulesInitializer {
  fill_rule: VectorLayerFillRulesFillRule

  sort?: number | null

  /** Default value: now() */
  created_at?: Date

  /** Default value: now() */
  updated_at?: Date

  updated_by?: string | null
}

/** Represents the mutator for the table public.vector_layer_fill_rules */
export interface VectorLayerFillRulesMutator {
  fill_rule?: VectorLayerFillRulesFillRule

  sort?: number | null

  created_at?: Date

  updated_at?: Date

  updated_by?: string | null
}
