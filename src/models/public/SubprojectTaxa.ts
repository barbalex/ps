import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { TaxaTaxonId } from './Taxa.js';

/** Identifier type for public.subproject_taxa */
export type SubprojectTaxaSubprojectTaxonId = string & { __brand: 'public.subproject_taxa' };

/**
 * Represents the table public.subproject_taxa
 * list wor what taxa data is managed in the subproject.
 */
export default interface SubprojectTaxa {
  subproject_taxon_id: SubprojectTaxaSubprojectTaxonId;

  subproject_id: SubprojectsSubprojectId | null;

  /** List of taxa that represent / are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or from different taxonomies. A taxon should be used in no more than one subproject. */
  taxon_id: TaxaTaxonId | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.subproject_taxa
 * list wor what taxa data is managed in the subproject.
 */
export interface SubprojectTaxaInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_taxon_id?: SubprojectTaxaSubprojectTaxonId;

  subproject_id?: SubprojectsSubprojectId | null;

  /** List of taxa that represent / are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or from different taxonomies. A taxon should be used in no more than one subproject. */
  taxon_id?: TaxaTaxonId | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.subproject_taxa
 * list wor what taxa data is managed in the subproject.
 */
export interface SubprojectTaxaMutator {
  subproject_taxon_id?: SubprojectTaxaSubprojectTaxonId;

  subproject_id?: SubprojectsSubprojectId | null;

  /** List of taxa that represent / are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or from different taxonomies. A taxon should be used in no more than one subproject. */
  taxon_id?: TaxaTaxonId | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}