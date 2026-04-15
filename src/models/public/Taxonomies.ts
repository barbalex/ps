import type { ProjectsProjectId } from './Projects.js';
import type { default as TaxonomyTypesEnum } from './TaxonomyTypesEnum.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.taxonomies */
export type TaxonomiesTaxonomyId = string & { __brand: 'public.taxonomies' };

/**
 * Represents the table public.taxonomies
 * A taxonomy is a list of taxa (species or biotopes).
 */
export default interface Taxonomies {
  taxonomy_id: TaxonomiesTaxonomyId;

  project_id: ProjectsProjectId | null;

  /** One of: "species", "biotope". Preset: "species" */
  type: TaxonomyTypesEnum | null;

  /** Unit of taxonomy. Helps analysing data for reporting. Examples: "abundance class", "percent cover". If no unit is set, the taxonomy is assumed to describe presence only. */
  unit_id: UnitsUnitId | null;

  /** Shortish name of taxonomy, like "Flora der Schweiz, 1995" */
  name: string | null;

  /** URL of taxonomy, like "https://www.infoflora.ch/de/flora" */
  url: string | null;

  /** Is taxonomy obsolete? Preset: false */
  obsolete: boolean | null;

  /** Room for taxonomy specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.taxonomies
 * A taxonomy is a list of taxa (species or biotopes).
 */
export interface TaxonomiesInitializer {
  /** Default value: uuid_generate_v7() */
  taxonomy_id?: TaxonomiesTaxonomyId;

  project_id?: ProjectsProjectId | null;

  /** One of: "species", "biotope". Preset: "species" */
  type?: TaxonomyTypesEnum | null;

  /** Unit of taxonomy. Helps analysing data for reporting. Examples: "abundance class", "percent cover". If no unit is set, the taxonomy is assumed to describe presence only. */
  unit_id?: UnitsUnitId | null;

  /** Shortish name of taxonomy, like "Flora der Schweiz, 1995" */
  name?: string | null;

  /** URL of taxonomy, like "https://www.infoflora.ch/de/flora" */
  url?: string | null;

  /**
   * Is taxonomy obsolete? Preset: false
   * Default value: false
   */
  obsolete?: boolean | null;

  /** Room for taxonomy specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.taxonomies
 * A taxonomy is a list of taxa (species or biotopes).
 */
export interface TaxonomiesMutator {
  taxonomy_id?: TaxonomiesTaxonomyId;

  project_id?: ProjectsProjectId | null;

  /** One of: "species", "biotope". Preset: "species" */
  type?: TaxonomyTypesEnum | null;

  /** Unit of taxonomy. Helps analysing data for reporting. Examples: "abundance class", "percent cover". If no unit is set, the taxonomy is assumed to describe presence only. */
  unit_id?: UnitsUnitId | null;

  /** Shortish name of taxonomy, like "Flora der Schweiz, 1995" */
  name?: string | null;

  /** URL of taxonomy, like "https://www.infoflora.ch/de/flora" */
  url?: string | null;

  /** Is taxonomy obsolete? Preset: false */
  obsolete?: boolean | null;

  /** Room for taxonomy specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}