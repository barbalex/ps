# Configuration

_Last updated: 8 May 2026_

---

## Why?

- [apflora.ch](https://apflora.ch) has been [developed since 2005](https://apflora.ch/Dokumentation/geschichte) and demonstrates the value of such a tool. Some nature conservation professionals involved wanted to be able to use it in other projects too
- There is no 'one size fits all' for nature conservation projects: most projects could/should not use apflora.ch unchanged
- Very few public institutions or ecological consultancies can or want to afford the development of a tailor-made product such as https://apflora.ch, https://vermehrung.ch or https://arteigenschaften.ch

## What?

That is why arten-fördern.app is highly configurable:

- Free naming of subprojects (e.g. as 'species' or 'habitats')
- Choice of default units (from self-defined lists, see below)
- Choice of which features are used and how they are displayed
- Choice of the number of levels for places (1 or 2)
- Free naming of place levels
- Choice of which features are used in which place levels (actions, checks, reports etc.)
- Ability to add custom fields to many tables
- Free definition and import of taxonomies
- Free definition and import of lists
- Selection of ready-made charts, ability to build custom ones
- Ability to build custom reports at project and sub-project level, incorporating charts
- Ability to import observations from any source
- Inclusion of various sources for map layers (WMS, WFS, imports...)
  - For split geometries, select the files together, check the source layers to include, and choose the UUID field separately for each layer (not needed for a single target object). Append or replace runs once per matched object across all selected layers. If any layer fails, nothing is changed.
  - **Export geometries** in a place, action or check list downloads its displayed objects with geometry in WGS84. Choose GeoPackage, GeoJSON, CSV (WKT) or KML. Each feature retains its UUID and attributes. Dropdowns retain their codes with readable `_label` columns where available; custom fields use `data_<key>`. Conflicting names gain a numeric suffix. To import edited geometries, match the original UUID column; other attributes are not rewritten.
  - To share a GIS file, choose **Upload** on a project vector layer. Select a GeoPackage, zipped Shapefile (include its sidecars), GeoJSON, KML/KMZ, GPX, CSV or zipped File Geodatabase. Choose the source layer and, for CSV, the X and Y columns. Check the source EPSG code when prompted; coordinates are converted to WGS84.
  - To update projects, places, actions or checks, choose **Import geometries** in the object's geometry menu or (except for projects) its list header. The same formats and CRS options apply. For a list, select the UUID field matching the displayed objects; for one object, no ID is needed. Geometries are appended by default. Replace affects only matched objects. Imports require an online connection and write access; project areas require polygons and designer or owner access. An invalid match cancels the entire import. Observation geometries remain derived from their source data.
  - Importing requires a connection and project write access. **Append** keeps the existing features; **Replace** removes them only if the import succeeds. After sync, activate, style and inspect the layer on the map, including offline. Limits: 64 MiB per file, 256 MiB uncompressed per archive.
- Free choice of coordinate reference system, ability to define your own
  - Use the globe beside “Show map center” to switch between WGS84 and the project's configured systems. In design mode, this changes the project default; otherwise, the choice is saved only for your account on this device.
- Selection of ready-made quality checks, ability to build custom ones
- Selection of ready-made exports, ability to build custom ones
- Available in 4 languages: German, French, Italian, English

## How?

You need to think at the very beginning about how to best organise your project and how to use arten-fördern.app for it.

For this, you have three options:

### 1 "I'll just get started and deal with configuration when it becomes necessary"

I’m glad if you take out a subscription for that. But it is likely that things could have gone much better for you all. Retroactive configuration changes can be very time-consuming and affect everyone involved.

If a project is successful, it develops over the years. Later adjustments and extensions are therefore rarely avoidable even with good preparation. But they can be minimised.

### 2 “I’ll take time at the start and configure it myself”

Good idea. Please let me know what I should document better, and what is missing or should work differently for your project.

### 3 “I’ll take time at the start and get support”

I do develop software today, but I also [know a thing or two about nature conservation](https://gabriel-software.ch/kontakt). If I think along with you, you can probably reduce your effort — and the likelihood or extent of later changes.

Your project and its optimal configuration in arten-fördern.app interests me. I would therefore be happy to help with planning from the start for free or at modest rates, and write off the effort as continuing education, networking and marketing.
