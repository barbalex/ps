# Exports

_Last updated: 27 November 2026_

---

Exports make it possible to:

1. Export parts of the data
2. Generate custom queries

Formats:

- .csv (simple, universally usable)
- .ods (for spreadsheet documents)
- .xlsx (for spreadsheet documents)

Users with the role "Owner" or "Designer" can choose which of the prepared exports are available — and can create their own.

Exports are available at the project and sub-project level (species/biotope).

Want to filter the export? You can set any filter on the base table in the filter form and then apply it when running the export.

## Open a project in QGIS

For a map, open the project and choose **Export project → GeoPackage (.gpkg)** in its header. Drag the downloaded file into QGIS and select the layers you want. GeoPackage is a SQLite database that tells QGIS which columns contain geometry and which coordinate system they use. No separate SpatiaLite export is needed.

If all places are points, select `places`. If the table mixes points, lines and polygons, select the corresponding layers, such as `places_points` or `places_lines`. Use `place_id` to join them to the attributes in `places`. Records without geometry remain in the table but do not appear on the map.

### Already have a plain SQLite export?

**SQLite (.sqlite)** is useful for queries and joins. It stores geometry as GeoJSON text, so QGIS opens `places` as a table. To show its points without changing the file:

1. Drag the `.sqlite` file into QGIS, add the `places` table and rename the layer `places_raw`.
2. Choose **Layer → Add Layer → Add/Edit Virtual Layer…**.
3. Paste this query and click **Add**:

```sql
SELECT p.place_id, p.name,
       SetSRID(CastToMultiPoint(CollectionExtract(GeomFromGeoJSON(p.geometry), 1)), 4326) AS geom
FROM places_raw AS p
WHERE p.geometry IS NOT NULL
```

The virtual layer draws all point parts in WGS 84 (EPSG:4326). It does not draw lines or polygons.
