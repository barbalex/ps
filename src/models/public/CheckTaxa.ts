import type { ChecksCheckId } from './Checks.js';
import type { TaxaTaxonId } from './Taxa.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.check_taxa */
export type CheckTaxaCheckTaxonId = string & { __brand: 'public.check_taxa' };

/** Represents the table public.check_taxa */
export default interface CheckTaxa {
  check_taxon_id: CheckTaxaCheckTaxonId;

  check_id: ChecksCheckId | null;

  taxon_id: TaxaTaxonId | null;

  unit_id: UnitsUnitId | null;

  quantity_integer: number | null;

  quantity_numeric: number | null;

  quantity_text: string | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table public.check_taxa */
export interface CheckTaxaInitializer {
  /** Default value: uuid_generate_v7() */
  check_taxon_id?: CheckTaxaCheckTaxonId;

  check_id?: ChecksCheckId | null;

  taxon_id?: TaxaTaxonId | null;

  unit_id?: UnitsUnitId | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table public.check_taxa */
export interface CheckTaxaMutator {
  check_taxon_id?: CheckTaxaCheckTaxonId;

  check_id?: ChecksCheckId | null;

  taxon_id?: TaxaTaxonId | null;

  unit_id?: UnitsUnitId | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}