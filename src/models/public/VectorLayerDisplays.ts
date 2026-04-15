import type { VectorLayersVectorLayerId } from './VectorLayers.js';
import type { default as VectorLayerMarkerTypesEnum } from './VectorLayerMarkerTypesEnum.js';
import type { default as VectorLayerLineCapsEnum } from './VectorLayerLineCapsEnum.js';
import type { default as VectorLayerLineJoinsEnum } from './VectorLayerLineJoinsEnum.js';
import type { default as VectorLayerFillRulesEnum } from './VectorLayerFillRulesEnum.js';

/** Identifier type for public.vector_layer_displays */
export type VectorLayerDisplaysVectorLayerDisplayId = string & { __brand: 'public.vector_layer_displays' };

/**
 * Represents the table public.vector_layer_displays
 * Goal: manage all map related properties of vector layers including places, actions, checks and observations
 */
export default interface VectorLayerDisplays {
  vector_layer_display_id: VectorLayerDisplaysVectorLayerDisplayId;

  vector_layer_id: VectorLayersVectorLayerId | null;

  /** Enables styling per property value */
  display_property_value: string | null;

  marker_type: VectorLayerMarkerTypesEnum | null;

  circle_marker_radius: number | null;

  /** Name of the symbol used for the marker */
  marker_symbol: string | null;

  /** Size in pixels of the symbol used for the marker. Defaults to 16 */
  marker_size: number | null;

  /** Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke */
  stroke: boolean | null;

  /** Stroke color. https://leafletjs.com/reference.html#path-color */
  color: string | null;

  /** Stroke width in pixels. https://leafletjs.com/reference.html#path-weight */
  weight: number | null;

  /** A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap */
  line_cap: VectorLayerLineCapsEnum | null;

  /** A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context */
  line_join: VectorLayerLineJoinsEnum | null;

  /** A string that defines the stroke dash pattern. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray */
  dash_array: string | null;

  /** A string that defines the distance into the dash pattern to start the dash. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset */
  dash_offset: string | null;

  /** Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill */
  fill: boolean | null;

  /** Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor */
  fill_color: string | null;

  /** Fill opacity. https://leafletjs.com/reference.html#path-fillopacity */
  fill_opacity_percent: number | null;

  /** A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule */
  fill_rule: VectorLayerFillRulesEnum | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.vector_layer_displays
 * Goal: manage all map related properties of vector layers including places, actions, checks and observations
 */
export interface VectorLayerDisplaysInitializer {
  /** Default value: uuid_generate_v7() */
  vector_layer_display_id?: VectorLayerDisplaysVectorLayerDisplayId;

  vector_layer_id?: VectorLayersVectorLayerId | null;

  /** Enables styling per property value */
  display_property_value?: string | null;

  /** Default value: 'circle'::vector_layer_marker_types_enum */
  marker_type?: VectorLayerMarkerTypesEnum | null;

  /** Default value: 8 */
  circle_marker_radius?: number | null;

  /** Name of the symbol used for the marker */
  marker_symbol?: string | null;

  /**
   * Size in pixels of the symbol used for the marker. Defaults to 16
   * Default value: 16
   */
  marker_size?: number | null;

  /**
   * Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke
   * Default value: true
   */
  stroke?: boolean | null;

  /**
   * Stroke color. https://leafletjs.com/reference.html#path-color
   * Default value: '#3388ff'::text
   */
  color?: string | null;

  /**
   * Stroke width in pixels. https://leafletjs.com/reference.html#path-weight
   * Default value: 3
   */
  weight?: number | null;

  /**
   * A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap
   * Default value: 'round'::vector_layer_line_caps_enum
   */
  line_cap?: VectorLayerLineCapsEnum | null;

  /**
   * A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context
   * Default value: 'round'::vector_layer_line_joins_enum
   */
  line_join?: VectorLayerLineJoinsEnum | null;

  /** A string that defines the stroke dash pattern. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray */
  dash_array?: string | null;

  /** A string that defines the distance into the dash pattern to start the dash. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset */
  dash_offset?: string | null;

  /**
   * Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill
   * Default value: true
   */
  fill?: boolean | null;

  /** Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor */
  fill_color?: string | null;

  /**
   * Fill opacity. https://leafletjs.com/reference.html#path-fillopacity
   * Default value: 100
   */
  fill_opacity_percent?: number | null;

  /**
   * A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule
   * Default value: 'evenodd'::vector_layer_fill_rules_enum
   */
  fill_rule?: VectorLayerFillRulesEnum | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.vector_layer_displays
 * Goal: manage all map related properties of vector layers including places, actions, checks and observations
 */
export interface VectorLayerDisplaysMutator {
  vector_layer_display_id?: VectorLayerDisplaysVectorLayerDisplayId;

  vector_layer_id?: VectorLayersVectorLayerId | null;

  /** Enables styling per property value */
  display_property_value?: string | null;

  marker_type?: VectorLayerMarkerTypesEnum | null;

  circle_marker_radius?: number | null;

  /** Name of the symbol used for the marker */
  marker_symbol?: string | null;

  /** Size in pixels of the symbol used for the marker. Defaults to 16 */
  marker_size?: number | null;

  /** Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke */
  stroke?: boolean | null;

  /** Stroke color. https://leafletjs.com/reference.html#path-color */
  color?: string | null;

  /** Stroke width in pixels. https://leafletjs.com/reference.html#path-weight */
  weight?: number | null;

  /** A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap */
  line_cap?: VectorLayerLineCapsEnum | null;

  /** A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context */
  line_join?: VectorLayerLineJoinsEnum | null;

  /** A string that defines the stroke dash pattern. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray */
  dash_array?: string | null;

  /** A string that defines the distance into the dash pattern to start the dash. Doesn't work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset */
  dash_offset?: string | null;

  /** Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill */
  fill?: boolean | null;

  /** Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor */
  fill_color?: string | null;

  /** Fill opacity. https://leafletjs.com/reference.html#path-fillopacity */
  fill_opacity_percent?: number | null;

  /** A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule */
  fill_rule?: VectorLayerFillRulesEnum | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}