---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

Custom form fields roadmap (places, checks, actions and other configurable forms):

- [x] Fix January and midnight date-time edits and numeric decimal entry. Add Markdown editing, preview and print. Hide rich text for new selections; keep existing fields editable as plain text.
- [ ] Controlled multiselect: checkboxes for short lists, searchable Fluent combobox for long lists. Both store the same array of typed codes. Support contains-any/all filters and export codes plus decoded labels.
- [ ] Searchable single-select for long lists without changing existing values.
- [ ] Numeric field settings: unit, minimum, maximum and step. Decimal entry already supports both point and comma.
- [ ] Explicit Yes / No / Not assessed buttons for nullable booleans. Use a coded list if more states are needed.
- [ ] Field instructions and conditional follow-ups. Never erase a saved answer merely because its field is hidden.

---

Geometry editing roadmap (in priority order):

- [x] 1. Place or move a point precisely: paste an X/Y pair in the coordinate system selected in the map coordinates tool, or pan beneath a crosshair. Preview, then explicitly apply to the edited record. Available while editing a place, check or action with no geometry or one point.
- [x] 2. Capture a GPS position with its reported horizontal accuracy. In **Place point precisely**, select **Capture GPS position**, review the accuracy circle and radius in metres, then apply. A manual geometry edit clears the stored accuracy.
  - [x] **Average 5 GPS fixes**: stand still while the editor collects five fresh positions, then review and apply their mean. The saved radius covers all five reported accuracy circles. Cancellation or timeout saves nothing.
- [x] 3. Undo/redo completed geometry edits within the current record's editing session. Each undo or redo saves a new version, including the bounding box and GPS accuracy. A new edit clears redo. The map names the record being edited; **Done** closes the session.
- [x] 4. Move a point, line or polygon: choose **Drag Layers**, then click or drag the shape. The selected shape has a dashed outline. Arrow keys move it by 0.3 mm on the rendered map (Shift+arrow: 2 mm), so zooming in gives finer ground steps. Turn off **Drag Layers** to undo or redo.
- [x] 5. While drawing or editing vertices, snap to visible vector points, vertices and boundaries. A ring and label show the target. Hold Alt while moving to bypass snapping, or toggle **Snapping** before starting a tool (also works on touch screens).
- [x] 6. **Record GPS track**: choose a transect or perimeter, start walking, then pause to review or simplify (1 m tolerance). On resume choose whether to connect to the last fix or start a separate part. Recording pauses when the tab is hidden. Save appends the preview as one undoable edit; Cancel discards it.
- [x] Record a GPS track or choose **Draw track** to tap vertices on the map (tap the last vertex again to finish). Then choose **Add as line** or **Add as polygon**. For one continuous track, select a target polygon in the current record to **Cut a hole**, **Reshape boundary**, or **Split polygon**. A hole must be strictly inside; a split must cross the polygon. For reshaping, both ends must be within 5 m of the outer boundary: the red arc and join points show what will be replaced (switch arcs if needed). Review before saving; each save is one undoable edit. Split pieces stay in the same record with its dependent data.

References: [QGIS editing](https://docs.qgis.org/latest/en/docs/user_manual/working_with_vector/editing_geometry_attributes.html), [QField digitizing](https://docs.qfield.org/how-to/data-collection/digitize/), [Field Maps capture](https://doc.esri.com/en/arcgis-field-maps/latest/use-maps/capture.html).

---

---

---

---

---

---

---

new box on the landing page:

title: Choose How You Like To Work
text: To edit your data you can navigate a hierarchical tree. Or using the map, stay permanently inside of it.

---

---

---

---

---

---

---

---

---

---

---

observations: when info panel is in form mode they should also render the same form as in regular forms, for instance like: /data/projects/0195a101-0000-7000-8000-000000000001/subprojects/017d3472-d75d-735d-8197-b6db29e70db3/observations-to-assess/a47f29f8-434e-11e8-ab21-b39199649de7

---

todo: info pane, title of places: should use same naming as in the nav tree and bookmarks. I am seeing 'Places' when it should be 'Sub-Populations'. Hm. not happening any more?

---

---

---

---

---

---

---

---

uptime monitoring beyond client error telemetry

---

idea: cost/effort tracking on actions: Reports to funders (e.g. BAFU Aktionsplan) typically require Kosten/Aufwand per measure

---

idea: coordinate rounding for exports/reports

---

idea: Global search across entities (similar to vermehrung?)

---

---

---

finish table_views:

- View form: Label rows: use the label tool as for observations?

- manually create the ones for 'Art Idealbiotop' and "Biotop" Feldgruppe to test how it works. then have them be created as part of the import. NB (2026-11): Feldergruppen are now per table (like Ansichten: tables list → table → groups), and the view form links to them when the table has none yet
- children: where do we choose which to use? place children in places config (exists for checks), rest in project config? Is it implemented to add this to the respective configs once a table_view was created?

---

---

done but to test and enhance:

new feature: design an own form to replace auto-generated one

similar as done for reports?

- simplest way to design would be a menu in the regular form when project is in editing mode
- enable toggling between autogenerated and self designed form
- enable building a grid
- enable using images
- printable
- can it also work offline (images?)

---

placement of 'Design form'?

---

---

completing apflora functionality:

- dropdown lists:
  - all _werte tables
  - ae_taxonomies
- EKF form ui
- EKF login and work
- beob
- biotop in check form
- exports
- export checks as observations
- re-import observations while upserting and recognizing own checks
- prepare and print EKF-Kontrollen
- plan checks
- maps: symbology?
- maps: layers (wms, ...)
- files
- quality controls
- more?

---

later:

- ensure all user facing text is translated
