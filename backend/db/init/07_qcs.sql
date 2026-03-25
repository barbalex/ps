-- qcs: quality controls for data
-- Generated from src/other/qcs.csv
-- Run `node backend/db/generate_qcs_sql.mjs` from project root to regenerate after editing the CSV.
--
-- place_level: NULL means the QC applies to all place levels (1 and 2).
--              An integer (1 or 2) restricts it to that specific place level.

INSERT INTO qcs (name, label_de, label_en, label_fr, label_it, table_name, place_level, is_root_level, is_project_level, is_subproject_level, filter_by_year, sql)
VALUES
('projectNameMissing', 'Projekte ohne Namen', 'Projects without name', 'Projets sans nom', 'Progetti senza nome', 'projects', NULL, false, true, false, false, 'SELECT p.label, ''/data/projects/'' || p.project_id || ''/project'' AS url
FROM projects p
WHERE p.project_id = $1
  AND nullif(p.name, '''') IS NULL
ORDER BY p.label'),
('userEmailMissing', 'Benutzer ohne Email', 'Users without email', 'Utilisateurs sans email', 'Utenti senza email', 'users', NULL, true, false, false, false, 'SELECT label, ''/data/users/'' || user_id AS url
FROM users
WHERE nullif(email, '''') IS NULL
ORDER BY label'),
('userNameMissing', 'Benutzer ohne Name', 'Users without name', 'Utilisateurs sans nom', 'Utenti senza nome', 'users', NULL, true, false, false, false, 'SELECT label, ''/data/users/'' || user_id AS url
FROM users
WHERE nullif(name, '''') IS NULL
ORDER BY label'),
('accountUserMissing', 'Konten ohne Benutzer', 'Accounts without user', 'Comptes sans utilisateur', 'Account senza utente', 'accounts', NULL, true, false, false, false, 'SELECT label, ''/data/accounts/'' || account_id AS url
FROM accounts
WHERE user_id IS NULL
ORDER BY label'),
('accountTypeMissing', 'Konten ohne Typ', 'Accounts without type', 'Comptes sans type', 'Account senza tipo', 'accounts', NULL, true, false, false, false, 'SELECT label, ''/data/accounts/'' || account_id AS url
FROM accounts
WHERE nullif(type, '''') IS NULL
ORDER BY label'),
('accountPeriodStartMissing', 'Konten ohne Startzeitpunkt', 'Accounts without start date', 'Comptes sans date de début', 'Account senza data di inizio', 'accounts', NULL, true, false, false, false, 'SELECT label, ''/data/accounts/'' || account_id AS url
FROM accounts
WHERE period_start IS NULL
ORDER BY label'),
('fieldTypesNameMissing', 'Feld-Typen ohne Namen', 'Field types without name', 'Types de champ sans nom', 'Tipi di campo senza nome', 'field_types', NULL, true, false, false, false, 'SELECT label, ''/data/field-types/'' || field_type_id AS url
FROM field_types
WHERE nullif(name, '''') IS NULL
ORDER BY label'),
('widgetTypesNameMissing', 'Widget-Typen ohne Namen', 'Widget types without name', 'Types de widget sans nom', 'Tipi di widget senza nome', 'widget_types', NULL, true, false, false, false, 'SELECT label, ''/data/widget-types/'' || widget_type_id AS url
FROM widget_types
WHERE nullif(name, '''') IS NULL
ORDER BY label'),
('widgetsForFieldsFieldTypeMissing', 'Widgets für Felder ohne Feld-Typ', 'Widgets for fields without field type', 'Widgets pour champs sans type de champ', 'Widget per campi senza tipo di campo', 'widgets_for_fields', NULL, true, false, false, false, 'SELECT label, ''/data/widgets-for-fields/'' || widget_for_field_id AS url
FROM widgets_for_fields
WHERE field_type_id IS NULL
ORDER BY label'),
('widgetsForFieldsWidgetTypeMissing', 'Widgets für Felder ohne Widget-Typ', 'Widgets for fields without widget type', 'Widgets pour champs sans type de widget', 'Widget per campi senza tipo di widget', 'widgets_for_fields', NULL, true, false, false, false, 'SELECT label, ''/data/widgets-for-fields/'' || widget_for_field_id AS url
FROM widgets_for_fields
WHERE widget_type_id IS NULL
ORDER BY label'),
('fieldsTableNameMissing', 'Felder ohne Tabelle', 'Fields without table', 'Champs sans table', 'Campi senza tabella', 'fields', NULL, true, false, false, false, 'SELECT f.label, ''/data/projects/'' || f.project_id || ''/fields/'' || f.field_id AS url
FROM fields f
WHERE nullif(f.table_name, '''') IS NULL
ORDER BY f.label'),
('fieldsLevelMissing', 'Ort-Felder ohne Stufe', 'Place fields without level', 'Champs de lieu sans niveau', 'Campi di luogo senza livello', 'fields', NULL, true, false, false, false, 'SELECT f.label, ''/data/projects/'' || f.project_id || ''/fields/'' || f.field_id AS url
FROM fields f
WHERE f.table_name IN (''places'', ''checks'', ''actions'', ''place_reports'', ''check_reports'', ''action_reports'')
  AND f.level IS NULL
ORDER BY f.label'),
('fieldsNameMissing', 'Felder ohne Namen', 'Fields without name', 'Champs sans nom', 'Campi senza nome', 'fields', NULL, true, false, false, false, 'SELECT f.label, ''/data/projects/'' || f.project_id || ''/fields/'' || f.field_id AS url
FROM fields f
WHERE nullif(f.name, '''') IS NULL
ORDER BY f.label'),
('fieldsFieldTypeMissing', 'Felder ohne Feld-Typ', 'Fields without field type', 'Champs sans type de champ', 'Campi senza tipo di campo', 'fields', NULL, true, false, false, false, 'SELECT f.label, ''/data/projects/'' || f.project_id || ''/fields/'' || f.field_id AS url
FROM fields f
WHERE f.field_type_id IS NULL
ORDER BY f.label'),
('fieldsWidgetTypeMissing', 'Felder ohne Widget', 'Fields without widget', 'Champs sans widget', 'Campi senza widget', 'fields', NULL, true, false, false, false, 'SELECT f.label, ''/data/projects/'' || f.project_id || ''/fields/'' || f.field_id AS url
FROM fields f
WHERE f.widget_type_id IS NULL
ORDER BY f.label'),
('placeLevelsLevelMissing', 'Ort-Stufen ohne Stufe', 'Place levels without level', 'Niveaux de lieu sans niveau', 'Livelli di luogo senza livello', 'place_levels', NULL, false, true, false, false, 'SELECT pl.label, ''/data/projects/'' || pl.project_id || ''/place-levels/'' || pl.place_level_id || ''/'' AS url
FROM place_levels pl
WHERE pl.project_id = $1
  AND pl.level IS NULL
ORDER BY pl.label'),
('placeLevelsDeMissing', 'Ort-Stufen ohne Deutsche Namen', 'Place levels without German name', 'Niveaux de lieu sans nom allemand', 'Livelli di luogo senza nome tedesco', 'place_levels', NULL, false, true, false, false, 'SELECT pl.label, ''/data/projects/'' || pl.project_id || ''/place-levels/'' || pl.place_level_id || ''/'' AS url
FROM place_levels pl
WHERE pl.project_id = $1
  AND nullif(pl.name_singular_de, '''') IS NULL
ORDER BY pl.label'),
('placeLevelsEnMissing', 'Ort-Stufen ohne Englische Namen', 'Place levels without English name', 'Niveaux de lieu sans nom anglais', 'Livelli di luogo senza nome inglese', 'place_levels', NULL, false, true, false, false, 'SELECT pl.label, ''/data/projects/'' || pl.project_id || ''/place-levels/'' || pl.place_level_id || ''/'' AS url
FROM place_levels pl
WHERE pl.project_id = $1
  AND nullif(pl.name_singular_en, '''') IS NULL
ORDER BY pl.label'),
('placeLevelsFrMissing', 'Ort-Stufen ohne Französische Namen', 'Place levels without French name', 'Niveaux de lieu sans nom français', 'Livelli di luogo senza nome francese', 'place_levels', NULL, false, true, false, false, 'SELECT pl.label, ''/data/projects/'' || pl.project_id || ''/place-levels/'' || pl.place_level_id || ''/'' AS url
FROM place_levels pl
WHERE pl.project_id = $1
  AND nullif(pl.name_singular_fr, '''') IS NULL
ORDER BY pl.label'),
('placeLevelsItMissing', 'Ort-Stufen ohne Italienische Namen', 'Place levels without Italian name', 'Niveaux de lieu sans nom italien', 'Livelli di luogo senza nome italiano', 'place_levels', NULL, false, true, false, false, 'SELECT pl.label, ''/data/projects/'' || pl.project_id || ''/place-levels/'' || pl.place_level_id || ''/'' AS url
FROM place_levels pl
WHERE pl.project_id = $1
  AND nullif(pl.name_singular_it, '''') IS NULL
ORDER BY pl.label'),
('observationImportsGeometrieMissing', 'Beobachtungs-Importe ohne Geometrie-Feld', 'Observation imports without geometry field', 'Importations d''observations sans champ de géométrie', 'Importazioni di osservazioni senza campo geometria', 'observation_imports', NULL, false, true, false, false, 'SELECT oi.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || oi.subproject_id || ''/observation-imports/'' || oi.observation_import_id || ''/'' AS url
FROM observation_imports oi
JOIN subprojects sp ON sp.subproject_id = oi.subproject_id
WHERE sp.project_id = $1
  AND oi.geometry_method IS NULL
ORDER BY oi.label'),
('observationImportsCrsMissing', 'Beobachtungs-Importe ohne KBS', 'Observation imports without CRS', 'Importations d''observations sans SCR', 'Importazioni di osservazioni senza SRC', 'observation_imports', NULL, false, true, false, false, 'SELECT oi.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || oi.subproject_id || ''/observation-imports/'' || oi.observation_import_id || ''/'' AS url
FROM observation_imports oi
JOIN subprojects sp ON sp.subproject_id = oi.subproject_id
WHERE sp.project_id = $1
  AND nullif(oi.crs, '''') IS NULL
ORDER BY oi.label'),
('observationImportsLabelMissing', 'Beobachtungs-Importe ohne Beschriftung', 'Observation imports without label', 'Importations d''observations sans étiquette', 'Importazioni di osservazioni senza etichetta', 'observation_imports', NULL, false, true, false, false, 'SELECT oi.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || oi.subproject_id || ''/observation-imports/'' || oi.observation_import_id || ''/'' AS url
FROM observation_imports oi
JOIN subprojects sp ON sp.subproject_id = oi.subproject_id
WHERE sp.project_id = $1
  AND (oi.label_creation IS NULL
  OR jsonb_array_length(oi.label_creation) = 0)
ORDER BY oi.label'),
('observationImportsNameMissing', 'Beobachtungs-Importe ohne Name', 'Observation imports without name', 'Importations d''observations sans nom', 'Importazioni di osservazioni senza nome', 'observation_imports', NULL, false, true, false, false, 'SELECT oi.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || oi.subproject_id || ''/observation-imports/'' || oi.observation_import_id || ''/'' AS url
FROM observation_imports oi
JOIN subprojects sp ON sp.subproject_id = oi.subproject_id
WHERE sp.project_id = $1
  AND nullif(oi.name, '''') IS NULL
ORDER BY oi.label'),
('wmsServicesUrlMissing', 'WMS-Dienste ohne URL', 'WMS services without URL', 'Services WMS sans URL', 'Servizi WMS senza URL', 'wms_services', NULL, false, true, false, false, 'SELECT ws.label, ''/data/projects/'' || ws.project_id || ''/wms-services/'' || ws.wms_service_id || ''/wms-service'' AS url
FROM wms_services ws
WHERE ws.project_id = $1
  AND nullif(ws.url, '''') IS NULL
ORDER BY ws.label'),
('wmsServicesServiceLayersMissing', 'WMS-Dienste ohne Ebenen', 'WMS services without layers', 'Services WMS sans couches', 'Servizi WMS senza livelli', 'wms_services', NULL, false, true, false, false, 'SELECT ws.label, ''/data/projects/'' || ws.project_id || ''/wms-services/'' || ws.wms_service_id || ''/wms-service'' AS url
FROM wms_services ws
WHERE ws.project_id = $1
  AND NOT EXISTS (SELECT 1
FROM wms_service_layers wsl
WHERE wsl.wms_service_id = ws.wms_service_id)
ORDER BY ws.label'),
('wmsLayersLayerMissing', 'WMS-Ebenen ohne Ebene', 'WMS layers without layer', 'Couches WMS sans couche', 'Layer WMS senza layer', 'wms_layers', NULL, false, true, false, false, 'SELECT wl.label, ''/data/projects/'' || wl.project_id || ''/wms-layers/'' || wl.wms_layer_id AS url
FROM wms_layers wl
WHERE wl.project_id = $1
  AND nullif(wl.wms_service_layer_name, '''') IS NULL
ORDER BY wl.label'),
('wfsServicesUrlMissing', 'WFS-Dienste ohne URL', 'WFS services without URL', 'Services WFS sans URL', 'Servizi WFS senza URL', 'wfs_services', NULL, false, true, false, false, 'SELECT ws.label, ''/data/projects/'' || ws.project_id || ''/wfs-services/'' || ws.wfs_service_id || ''/wfs-service'' AS url
FROM wfs_services ws
WHERE ws.project_id = $1
  AND nullif(ws.url, '''') IS NULL
ORDER BY ws.label'),
('wfsServicesServiceLayersMissing', 'WFS-Dienste ohne Ebenen', 'WFS services without layers', 'Services WFS sans couches', 'Servizi WFS senza livelli', 'wfs_services', NULL, false, true, false, false, 'SELECT ws.label, ''/data/projects/'' || ws.project_id || ''/wfs-services/'' || ws.wfs_service_id || ''/wfs-service'' AS url
FROM wfs_services ws
WHERE ws.project_id = $1
  AND NOT EXISTS (SELECT 1
FROM wfs_service_layers wsl
WHERE wsl.wfs_service_id = ws.wfs_service_id)
ORDER BY ws.label'),
('vectorLayersDisplaysMissing', 'Vektor-Ebenen ohne Anzeigen', 'Vector layers without display', 'Couches vectorielles sans affichage', 'Layer vettoriali senza visualizzazione', 'vector_layers', NULL, false, true, false, false, 'SELECT vl.label, ''/data/projects/'' || vl.project_id || ''/vector-layers/'' || vl.vector_layer_id || ''/vector-layer'' AS url
FROM vector_layers vl
WHERE vl.project_id = $1
  AND NOT EXISTS (SELECT 1
FROM vector_layer_displays vld
WHERE vld.vector_layer_id = vl.vector_layer_id)
ORDER BY vl.label'),
('vectorLayersTypeMissing', 'Vektor-Ebenen ohne Typ', 'Vector layers without type', 'Couches vectorielles sans type', 'Layer vettoriali senza tipo', 'vector_layers', NULL, false, true, false, false, 'SELECT vl.label, ''/data/projects/'' || vl.project_id || ''/vector-layers/'' || vl.vector_layer_id || ''/vector-layer'' AS url
FROM vector_layers vl
WHERE vl.project_id = $1
  AND vl.type IS NULL
ORDER BY vl.label'),
('vectorLayersNameMissing', 'Vektor-Ebenen ohne Name', 'Vector layers without name', 'Couches vectorielles sans nom', 'Layer vettoriali senza nome', 'vector_layers', NULL, false, true, false, false, 'SELECT vl.label, ''/data/projects/'' || vl.project_id || ''/vector-layers/'' || vl.vector_layer_id || ''/vector-layer'' AS url
FROM vector_layers vl
WHERE vl.project_id = $1
  AND nullif(vl.label, '''') IS NULL
ORDER BY vl.label'),
('vectorLayersPresentationMissing', 'Vektor-Ebene ohne «Presentation»', 'Vector layer without presentation', 'Couche vectorielle sans présentation', 'Layer vettoriale senza presentazione', 'vector_layers', NULL, false, true, false, false, 'SELECT vl.label, ''/data/projects/'' || vl.project_id || ''/vector-layers/'' || vl.vector_layer_id || ''/vector-layer'' AS url
FROM vector_layers vl
WHERE vl.project_id = $1
  AND vl.display_by_property IS NOT NULL
  AND NOT EXISTS (SELECT 1
FROM vector_layer_displays vld
WHERE vld.vector_layer_id = vl.vector_layer_id
  AND vld.display_property_value IS NOT NULL)
ORDER BY vl.label'),
('chartsSubjectMissing', 'Diagramme ohne Themen', 'Charts without subjects', 'Graphiques sans sujets', 'Grafici senza soggetti', 'charts', NULL, false, false, true, false, 'SELECT c.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || c.chart_id || ''/chart'' AS url
FROM charts c
WHERE c.subproject_id = $1
  AND NOT EXISTS (SELECT 1
FROM chart_subjects cs
WHERE cs.chart_id = c.chart_id)
ORDER BY c.label'),
('chartsTypeMissing', 'Diagramme ohne Typ', 'Charts without type', 'Graphiques sans type', 'Grafici senza tipo', 'charts', NULL, false, false, true, false, 'SELECT c.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || c.chart_id || ''/chart'' AS url
FROM charts c
WHERE c.subproject_id = $1
  AND c.chart_type IS NULL
ORDER BY c.label'),
('chartsNameMissing', 'Diagramme ohne Name', 'Charts without name', 'Graphiques sans nom', 'Grafici senza nome', 'charts', NULL, false, false, true, false, 'SELECT c.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || c.chart_id || ''/chart'' AS url
FROM charts c
WHERE c.subproject_id = $1
  AND nullif(c.name, '''') IS NULL
ORDER BY c.label'),
('chartSubjectsNameMissing', 'Diagramm-Themen ohne Name', 'Chart subjects without name', 'Sujets de graphique sans nom', 'Soggetti grafici senza nome', 'chart_subjects', NULL, false, false, true, false, 'SELECT cs.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || cs.chart_id || ''/subjects/'' || cs.chart_subject_id || ''/'' AS url
FROM chart_subjects cs
JOIN charts c ON c.chart_id = cs.chart_id
WHERE c.subproject_id = $1
  AND nullif(cs.name, '''') IS NULL
ORDER BY cs.label'),
('chartSubjectsTableMissing', 'Diagramm-Themen ohne Tabelle', 'Chart subjects without table', 'Sujets de graphique sans table', 'Soggetti grafici senza tabella', 'chart_subjects', NULL, false, false, true, false, 'SELECT cs.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || cs.chart_id || ''/subjects/'' || cs.chart_subject_id || ''/'' AS url
FROM chart_subjects cs
JOIN charts c ON c.chart_id = cs.chart_id
WHERE c.subproject_id = $1
  AND cs.table_name IS NULL
ORDER BY cs.label'),
('chartSubjectsCalcMethodMissing', 'Diagramm-Themen ohne Berechnungsmethode', 'Chart subjects without calculation method', 'Sujets de graphique sans méthode de calcul', 'Soggetti grafici senza metodo di calcolo', 'chart_subjects', NULL, false, false, true, false, 'SELECT cs.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || cs.chart_id || ''/subjects/'' || cs.chart_subject_id || ''/'' AS url
FROM chart_subjects cs
JOIN charts c ON c.chart_id = cs.chart_id
WHERE c.subproject_id = $1
  AND cs.calc_method IS NULL
ORDER BY cs.label'),
('chartSubjectsStrokeOrFillMissing', 'Diagramm-Themen ohne Farbe', 'Chart subjects without color', 'Sujets de graphique sans couleur', 'Soggetti grafici senza colore', 'chart_subjects', NULL, false, false, true, false, 'SELECT cs.label, ''/data/projects/'' || c.project_id || ''/subprojects/'' || c.subproject_id || ''/charts/'' || cs.chart_id || ''/subjects/'' || cs.chart_subject_id || ''/'' AS url
FROM chart_subjects cs
JOIN charts c ON c.chart_id = cs.chart_id
WHERE c.subproject_id = $1
  AND nullif(cs.stroke, '''') IS NULL
  AND nullif(cs.fill, '''') IS NULL
ORDER BY cs.label'),
('projectCrsCrsMissing', 'Projekt-KBS ohne KBS', 'Project CRS without CRS', 'CRS de projet sans CRS', 'CRS di progetto senza CRS', 'project_crs', NULL, false, true, false, false, 'SELECT pc.label, ''/data/projects/'' || pc.project_id || ''/crs/'' || pc.project_crs_id || ''/'' AS url
FROM project_crs pc
WHERE pc.project_id = $1
  AND nullif(pc.code, '''') IS NULL
ORDER BY pc.label'),
('unitsNameMissing', 'Einheiten ohne Name', 'Units without name', 'Unités sans nom', 'Unità senza nome', 'units', NULL, false, true, false, false, 'SELECT u.label, ''/data/projects/'' || u.project_id || ''/units/'' || u.unit_id || ''/'' AS url
FROM units u
WHERE u.project_id = $1
  AND nullif(u.name, '''') IS NULL
ORDER BY u.label'),
('unitsTypeMissing', 'Einheiten ohne Typ', 'Units without type', 'Unités sans type', 'Unità senza tipo', 'units', NULL, false, true, false, false, 'SELECT u.label, ''/data/projects/'' || u.project_id || ''/units/'' || u.unit_id || ''/'' AS url
FROM units u
WHERE u.project_id = $1
  AND u.type IS NULL
ORDER BY u.label'),
('taxonomiesNameMissing', 'Taxonomien ohne Name', 'Taxonomies without name', 'Taxonomies sans nom', 'Tassonomie senza nome', 'taxonomies', NULL, false, true, false, false, 'SELECT t.label, ''/data/projects/'' || t.project_id || ''/taxonomies/'' || t.taxonomy_id || ''/taxonomy'' AS url
FROM taxonomies t
WHERE t.project_id = $1
  AND nullif(t.name, '''') IS NULL
ORDER BY t.label'),
('taxonomiesTypeMissing', 'Taxonomien ohne Typ', 'Taxonomies without type', 'Taxonomies sans type', 'Tassonomie senza tipo', 'taxonomies', NULL, false, true, false, false, 'SELECT t.label, ''/data/projects/'' || t.project_id || ''/taxonomies/'' || t.taxonomy_id || ''/taxonomy'' AS url
FROM taxonomies t
WHERE t.project_id = $1
  AND t.type IS NULL
ORDER BY t.label'),
('taxonomiesTaxaMissing', 'Taxonomien ohne Taxa', 'Taxonomies without taxa', 'Taxonomies sans taxons', 'Tassonomie senza taxa', 'taxonomies', NULL, false, true, false, false, 'SELECT t.label, ''/data/projects/'' || t.project_id || ''/taxonomies/'' || t.taxonomy_id || ''/taxonomy'' AS url
FROM taxonomies t
WHERE t.project_id = $1
  AND NOT EXISTS (SELECT 1
FROM taxa tx
WHERE tx.taxonomy_id = t.taxonomy_id)
ORDER BY t.label'),
('taxaNameMissing', 'Taxon ohne Namen', 'Taxon without name', 'Taxon sans nom', 'Taxon senza nome', 'taxa', NULL, false, true, false, false, 'SELECT tx.label, ''/data/projects/'' || t.project_id || ''/taxonomies/'' || tx.taxonomy_id || ''/taxa/'' || tx.taxon_id || ''/'' AS url
FROM taxa tx
JOIN taxonomies t ON t.taxonomy_id = tx.taxonomy_id
WHERE t.project_id = $1
  AND nullif(tx.name, '''') IS NULL
ORDER BY tx.label'),
('listsNameMissing', 'Listen ohne Namen', 'Lists without name', 'Listes sans nom', 'Liste senza nome', 'lists', NULL, false, true, false, false, 'SELECT l.label, ''/data/projects/'' || l.project_id || ''/lists/'' || l.list_id || ''/list'' AS url
FROM lists l
WHERE l.project_id = $1
  AND nullif(l.name, '''') IS NULL
ORDER BY l.label'),
('listsValueTypeMissing', 'Listen ohne Wert-Typ', 'Lists without value type', 'Listes sans type de valeur', 'Liste senza tipo di valore', 'lists', NULL, false, true, false, false, 'SELECT l.label, ''/data/projects/'' || l.project_id || ''/lists/'' || l.list_id || ''/list'' AS url
FROM lists l
WHERE l.project_id = $1
  AND l.value_type IS NULL
ORDER BY l.label'),
('listsValuesMissing', 'Listen ohne Werte', 'Lists without values', 'Listes sans valeurs', 'Liste senza valori', 'lists', NULL, false, true, false, false, 'SELECT l.label, ''/data/projects/'' || l.project_id || ''/lists/'' || l.list_id || ''/list'' AS url
FROM lists l
WHERE l.project_id = $1
  AND NOT EXISTS (SELECT 1
FROM list_values lv
WHERE lv.list_id = l.list_id)
ORDER BY l.label'),
('projectUsersUserMissing', 'Projekt-Benutzer ohne Benutzer', 'Project users without user', 'Utilisateurs de projet sans utilisateur', 'Utenti di progetto senza utente', 'project_users', NULL, false, true, false, false, 'SELECT pu.label, ''/data/projects/'' || pu.project_id || ''/users/'' || pu.project_user_id || ''/'' AS url
FROM project_users pu
WHERE pu.project_id = $1
  AND pu.user_id IS NULL
ORDER BY pu.label'),
('projectUsersRoleMissing', 'Projekt-Benutzer ohne Rolle', 'Project users without role', 'Utilisateurs de projet sans rôle', 'Utenti di progetto senza ruolo', 'project_users', NULL, false, true, false, false, 'SELECT pu.label, ''/data/projects/'' || pu.project_id || ''/users/'' || pu.project_user_id || ''/'' AS url
FROM project_users pu
WHERE pu.project_id = $1
  AND pu.role IS NULL
ORDER BY pu.label'),
('projectReportsYearMissing', 'Projekt-Berichte ohne Jahr', 'Project reports without year', 'Rapports de projet sans année', 'Rapporti di progetto senza anno', 'project_reports', NULL, false, true, false, false, 'SELECT pr.label, ''/data/projects/'' || pr.project_id || ''/reports/'' || pr.project_report_id || ''/'' AS url
FROM project_reports pr
WHERE pr.project_id = $1
  AND pr.year IS NULL
ORDER BY pr.label'),
('subprojectReportsYearMissing', 'Teil-Projekt-Berichte ohne Jahr', 'Subproject reports without year', 'Rapports de sous-projet sans année', 'Rapporti di sottoprogetto senza anno', 'subproject_reports', NULL, false, false, true, false, 'SELECT sr.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || sr.subproject_id || ''/reports/'' || sr.subproject_report_id || ''/'' AS url
FROM subproject_reports sr
JOIN subprojects sp ON sp.subproject_id = sr.subproject_id
WHERE sr.subproject_id = $1
  AND sr.year IS NULL
ORDER BY sr.label'),
('subprojectReportsDataMissing', 'Teil-Projekt-Berichte ohne Daten', 'Subproject reports without data', 'Rapports de sous-projet sans données', 'Rapporti di sottoprogetto senza dati', 'subproject_reports', NULL, false, false, true, true, 'SELECT sr.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || sr.subproject_id || ''/reports/'' || sr.subproject_report_id || ''/'' AS url
FROM subproject_reports sr
JOIN subprojects sp ON sp.subproject_id = sr.subproject_id
WHERE sr.subproject_id = $1
  AND sr.data IS NULL
ORDER BY sr.label'),
('projectReportDesignsNameMissing', 'Projekt-Bericht-Designs ohne Name', 'Project report designs without name', 'Designs de rapport de projet sans nom', 'Design di rapporto di progetto senza nome', 'project_report_designs', NULL, false, true, false, false, 'SELECT prd.label, ''/data/projects/'' || prd.project_id || ''/designs/'' || prd.project_report_design_id || ''/'' AS url
FROM project_report_designs prd
WHERE prd.project_id = $1
  AND nullif(prd.name, '''') IS NULL
ORDER BY prd.label'),
('projectReportDesignsDesignMissing', 'Projekt-Bericht-Designs ohne Design', 'Project report designs without design', 'Designs de rapport de projet sans design', 'Design di rapporto di progetto senza design', 'project_report_designs', NULL, false, true, false, false, 'SELECT prd.label, ''/data/projects/'' || prd.project_id || ''/designs/'' || prd.project_report_design_id || ''/'' AS url
FROM project_report_designs prd
WHERE prd.project_id = $1
  AND prd.design IS NULL
ORDER BY prd.label'),
('subprojectReportDesignsNameMissing', 'Teil-Projekt-Bericht-Designs ohne Name', 'Subproject report designs without name', 'Designs de rapport de sous-projet sans nom', 'Design di rapporto di sottoprogetto senza nome', 'subproject_report_designs', NULL, false, false, true, false, 'SELECT srd.label, ''/data/projects/'' || srd.project_id || ''/subproject-designs/'' || srd.subproject_report_design_id || ''/'' AS url
FROM subproject_report_designs srd
JOIN subprojects sp ON sp.project_id = srd.project_id
WHERE sp.subproject_id = $1
  AND nullif(srd.name, '''') IS NULL
ORDER BY srd.label'),
('subprojectReportDesignsDesignMissing', 'Teil-Projekt-Bericht-Designs ohne Design', 'Subproject report designs without design', 'Designs de rapport de sous-projet sans design', 'Design di rapporto di sottoprogetto senza design', 'subproject_report_designs', NULL, false, false, true, false, 'SELECT srd.label, ''/data/projects/'' || srd.project_id || ''/subproject-designs/'' || srd.subproject_report_design_id || ''/'' AS url
FROM subproject_report_designs srd
JOIN subprojects sp ON sp.project_id = srd.project_id
WHERE sp.subproject_id = $1
  AND srd.design IS NULL
ORDER BY srd.label'),
('subprojectUserUserMissing', 'Teil-Projekt-Benutzer ohne Benutzer', 'Subproject users without user', 'Utilisateurs de sous-projet sans utilisateur', 'Utenti di sottoprogetto senza utente', 'subproject_users', NULL, false, false, true, false, 'SELECT su.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || su.subproject_id || ''/users/'' || su.subproject_user_id || ''/'' AS url
FROM subproject_users su
JOIN subprojects sp ON sp.subproject_id = su.subproject_id
WHERE su.subproject_id = $1
  AND su.user_id IS NULL
ORDER BY su.label'),
('subprojectUserRoleMissing', 'Teil-Projekt-Benutzer ohne Rolle', 'Subproject users without role', 'Utilisateurs de sous-projet sans rôle', 'Utenti di sottoprogetto senza ruolo', 'subproject_users', NULL, false, false, true, false, 'SELECT su.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || su.subproject_id || ''/users/'' || su.subproject_user_id || ''/'' AS url
FROM subproject_users su
JOIN subprojects sp ON sp.subproject_id = su.subproject_id
WHERE su.subproject_id = $1
  AND su.role IS NULL
ORDER BY su.label'),
('subprojectTaxaTaxonMissing', 'Teil-Projekt-Taxa ohne Taxon', 'Subproject taxa without taxon', 'Taxons de sous-projet sans taxon', 'Taxa di sottoprogetto senza taxon', 'subproject_taxa', NULL, false, false, true, false, 'SELECT st.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || st.subproject_id || ''/taxa/'' || st.subproject_taxon_id || ''/'' AS url
FROM subproject_taxa st
JOIN subprojects sp ON sp.subproject_id = st.subproject_id
WHERE st.subproject_id = $1
  AND st.taxon_id IS NULL
ORDER BY st.label'),
('goalsYearMissing', 'Ziele ohne Jahr', 'Goals without year', 'Objectifs sans année', 'Obiettivi senza anno', 'goals', NULL, false, false, true, false, 'SELECT g.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || g.subproject_id || ''/goals/'' || g.goal_id || ''/goal'' AS url
FROM goals g
JOIN subprojects sp ON sp.subproject_id = g.subproject_id
WHERE g.subproject_id = $1
  AND g.year IS NULL
ORDER BY g.label'),
('goalsNameMissing', 'Ziele ohne Namen', 'Goals without name', 'Objectifs sans nom', 'Obiettivi senza nome', 'goals', NULL, false, false, true, true, 'SELECT g.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || g.subproject_id || ''/goals/'' || g.goal_id || ''/goal'' AS url
FROM goals g
JOIN subprojects sp ON sp.subproject_id = g.subproject_id
WHERE g.subproject_id = $1
  AND nullif(g.name, '''') IS NULL
ORDER BY g.label'),
('goalsReportMissing', 'Ziele ohne Bericht', 'Goals without report', 'Objectifs sans rapport', 'Obiettivi senza rapporto', 'goals', NULL, false, false, true, true, 'SELECT g.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || g.subproject_id || ''/goals/'' || g.goal_id || ''/goal'' AS url
FROM goals g
JOIN subprojects sp ON sp.subproject_id = g.subproject_id
WHERE g.subproject_id = $1
  AND NOT EXISTS (SELECT 1
FROM goal_reports gr
WHERE gr.goal_id = g.goal_id)
ORDER BY g.label'),
('subprojectsNameMissing', 'Teil-Projekt ohne Name', 'Subproject without name', 'Sous-projet sans nom', 'Sottoprogetto senza nome', 'subprojects', NULL, false, false, true, false, 'SELECT sp.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || sp.subproject_id || ''/subproject'' AS url
FROM subprojects sp
WHERE sp.subproject_id = $1
  AND nullif(sp.name, '''') IS NULL
ORDER BY sp.label'),
('subprojectsStartYearMissing', 'Teil-Projekt ohne Startjahr', 'Subproject without start year', 'Sous-projet sans année de début', 'Sottoprogetto senza anno di inizio', 'subprojects', NULL, false, false, true, false, 'SELECT sp.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || sp.subproject_id || ''/subproject'' AS url
FROM subprojects sp
WHERE sp.subproject_id = $1
  AND sp.start_year IS NULL
ORDER BY sp.label'),
('subprojectsPlaces1Missing', 'Teil-Projekt ohne Orte', 'Subproject without places', 'Sous-projet sans lieux', 'Sottoprogetto senza luoghi', 'subprojects', NULL, false, false, true, false, 'SELECT sp.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || sp.subproject_id || ''/subproject'' AS url
FROM subprojects sp
WHERE sp.subproject_id = $1
  AND NOT EXISTS (SELECT 1
FROM places p
WHERE p.subproject_id = sp.subproject_id
  AND p.level = 1)
ORDER BY sp.label'),
('placesGeometryMissing', 'Orte (relevante und aktuell existierende) ohne Geometrie', 'Places (relevant and currently existing) without geometry', 'Lieux (pertinents et actuellement existants) sans géométrie', 'Luoghi (rilevanti e attualmente esistenti) senza geometria', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/place'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND p.geometry IS NULL
ORDER BY p.label'),
('placesSinceMissing', 'Orte (relevante und aktuell existierende) ohne Seit wann', 'Places (relevant and currently existing) without since date', 'Lieux (pertinents et actuellement existants) sans date de début', 'Luoghi (rilevanti e attualmente esistenti) senza data di inizio', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/place'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND p.since IS NULL
ORDER BY p.label'),
('placesNameMissing', 'Orte (relevante und aktuell existierende) ohne Name', 'Places (relevant and currently existing) without name', 'Lieux (pertinents et actuellement existants) sans nom', 'Luoghi (rilevanti e attualmente esistenti) senza nome', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/place'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND nullif(p.label, '''') IS NULL
ORDER BY p.label'),
('placesFilesMissing', 'Orte (relevante und aktuell existierende) ohne Dateien', 'Places (relevant and currently existing) without files', 'Lieux (pertinents et actuellement existants) sans fichiers', 'Luoghi (rilevanti e attualmente esistenti) senza file', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/files/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM files f
WHERE f.place_id = p.place_id)
ORDER BY p.label'),
('placesChecksMissing', 'Orte (relevante und aktuell existierende) ohne Kontrollen', 'Places (relevant and currently existing) without checks', 'Lieux (pertinents et actuellement existants) sans contrôles', 'Luoghi (rilevanti e attualmente esistenti) senza controlli', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/checks/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM checks c
WHERE c.place_id = p.place_id)
ORDER BY p.label'),
('placesChecksMissingInYear', 'Orte (relevante und aktuell existierende) ohne Kontrolle in Jahr', 'Places (relevant and currently existing) without check in year', 'Lieux (pertinents et actuellement existants) sans contrôle dans l''année', 'Luoghi (rilevanti e attualmente esistenti) senza controllo nell''anno', 'places', NULL, false, false, true, true, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/checks/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM checks c
WHERE c.place_id = p.place_id
  AND date_part(''year'', c.date) = date_part(''year'', now()))
ORDER BY p.label'),
('placesActionsMissing', 'Orte (relevante und aktuell existierende) ohne Massnahmen', 'Places (relevant and currently existing) without actions', 'Lieux (pertinents et actuellement existants) sans actions', 'Luoghi (rilevanti e attualmente esistenti) senza azioni', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/actions/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM actions a
WHERE a.place_id = p.place_id)
ORDER BY p.label'),
('placesActionsMissingInYear', 'Orte (relevante und aktuell existierende) ohne Massnahme in Jahr', 'Places (relevant and currently existing) without action in year', 'Lieux (pertinents et actuellement existants) sans action dans l''année', 'Luoghi (rilevanti e attualmente esistenti) senza azione nell''anno', 'places', NULL, false, false, true, true, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/actions/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM actions a
WHERE a.place_id = p.place_id
  AND date_part(''year'', a.date) = date_part(''year'', now()))
ORDER BY p.label'),
('placesReportsMissing', 'Orte (relevante und aktuell existierende) ohne Berichte', 'Places (relevant and currently existing) without reports', 'Lieux (pertinents et actuellement existants) sans rapports', 'Luoghi (rilevanti e attualmente esistenti) senza rapporti', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/reports/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM place_reports pr
WHERE pr.place_id = p.place_id)
ORDER BY p.label'),
('placesReportsMissingInYear', 'Orte (relevante und aktuell existierende) ohne Bericht in Jahr', 'Places (relevant and currently existing) without report in year', 'Lieux (pertinents et actuellement existants) sans rapport dans l''année', 'Luoghi (rilevanti e attualmente esistenti) senza rapporto nell''anno', 'places', NULL, false, false, true, true, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/reports/'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM place_reports pr
WHERE pr.place_id = p.place_id
  AND pr.year = date_part(''year'', now())::integer)
ORDER BY p.label'),
('places1Places2Missing', 'Orte (relevante und aktuell existierende) Stufe 1 ohne Stufe 2', 'Places (relevant and currently existing) level 1 without level 2', 'Lieux (pertinents et actuellement existants) niveau 1 sans niveau 2', 'Luoghi (rilevanti e attualmente esistenti) livello 1 senza livello 2', 'places', 1, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || s.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/place'' AS url
FROM places p
JOIN subprojects s ON s.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND p.level = 1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND NOT EXISTS (SELECT 1
FROM places p2
WHERE p2.parent_id = p.place_id)
ORDER BY p.label'),
('placeUsersUserMissing', 'Ort-Benutzer ohne Benutzer', 'Place users without user', 'Utilisateurs de lieu sans utilisateur', 'Utenti di luogo senza utente', 'place_users', NULL, false, false, true, false, 'SELECT pu.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || pu.place_id || ''/users/'' || pu.place_user_id || ''/'' AS url
FROM place_users pu
JOIN places p ON p.place_id = pu.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND pu.user_id IS NULL
ORDER BY pu.label'),
('placeUsersRoleMissing', 'Ort-Benutzer ohne Rolle', 'Place users without role', 'Utilisateurs de lieu sans rôle', 'Utenti di luogo senza ruolo', 'place_users', NULL, false, false, true, false, 'SELECT pu.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || pu.place_id || ''/users/'' || pu.place_user_id || ''/'' AS url
FROM place_users pu
JOIN places p ON p.place_id = pu.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND pu.role IS NULL
ORDER BY pu.label'),
('checksDateMissing', 'Kontrollen (relevante) ohne Datum', 'Checks (relevant) without date', 'Contrôles (pertinents) sans date', 'Controlli (rilevanti) senza data', 'checks', NULL, false, false, true, false, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/check'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND c.date IS NULL
ORDER BY c.label'),
('checksGeometryMissing', 'Kontrollen (relevante) ohne Geometrie', 'Checks (relevant) without geometry', 'Contrôles (pertinents) sans géométrie', 'Controlli (rilevanti) senza geometria', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/check'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND c.geometry IS NULL
ORDER BY c.label'),
('checksQuantitiesMissing', 'Kontrollen (relevante) ohne Menge', 'Checks (relevant) without quantity', 'Contrôles (pertinents) sans quantité', 'Controlli (rilevanti) senza quantità', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/quantities/'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM check_quantities cq
WHERE cq.check_id = c.check_id)
ORDER BY c.label'),
('checksTaxaMissing', 'Kontrollen (relevante) ohne Taxa', 'Checks (relevant) without taxa', 'Contrôles (pertinents) sans taxons', 'Controlli (rilevanti) senza taxa', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/taxa/'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM check_taxa ct
WHERE ct.check_id = c.check_id)
ORDER BY c.label'),
('checksReportMissingInYear', 'Kontrollen (relevante) ohne Bericht in Jahr', 'Checks (relevant) without report in year', 'Contrôles (pertinents) sans rapport dans l''année', 'Controlli (rilevanti) senza rapporto nell''anno', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/reports/'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM check_reports cr
WHERE cr.check_id = c.check_id
  AND cr.year = date_part(''year'', now())::integer)
ORDER BY c.label'),
('checksFilesMissing', 'Kontrollen (relevante) ohne Datei', 'Checks (relevant) without file', 'Contrôles (pertinents) sans fichier', 'Controlli (rilevanti) senza file', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/files/'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM files f
WHERE f.check_id = c.check_id)
ORDER BY c.label'),
('actionsDateMissing', 'Massnahmen (relevante) ohne Datum', 'Actions (relevant) without date', 'Actions (pertinentes) sans date', 'Azioni (rilevanti) senza data', 'actions', NULL, false, false, true, false, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/action'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND a.date IS NULL
ORDER BY a.label'),
('actionsGeometryMissing', 'Massnahmen (relevante) ohne Geometrie', 'Actions (relevant) without geometry', 'Actions (pertinentes) sans géométrie', 'Azioni (rilevanti) senza geometria', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/action'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND a.geometry IS NULL
ORDER BY a.label'),
('actionsQuantitiesMissing', 'Massnahmen (relevante) ohne Menge', 'Actions (relevant) without quantity', 'Actions (pertinentes) sans quantité', 'Azioni (rilevanti) senza quantità', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/quantities/'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM action_quantities aq
WHERE aq.action_id = a.action_id)
ORDER BY a.label'),
('actionsTaxaMissing', 'Massnahmen (relevante) ohne Taxa', 'Actions (relevant) without taxa', 'Actions (pertinentes) sans taxons', 'Azioni (rilevanti) senza taxa', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/taxa/'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM action_taxa atx
WHERE atx.action_id = a.action_id)
ORDER BY a.label'),
('actionsReportMissingInYear', 'Massnahmen (relevante) ohne Bericht in Jahr', 'Actions (relevant) without report in year', 'Actions (pertinentes) sans rapport dans l''année', 'Azioni (rilevanti) senza rapporto nell''anno', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/reports/'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM action_reports ar
WHERE ar.action_id = a.action_id
  AND ar.year = date_part(''year'', now())::integer)
ORDER BY a.label'),
('actionsFilesMissing', 'Massnahmen (relevante) ohne Datei', 'Actions (relevant) without file', 'Actions (pertinentes) sans fichier', 'Azioni (rilevanti) senza file', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/files/'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND NOT EXISTS (SELECT 1
FROM files f
WHERE f.action_id = a.action_id)
ORDER BY a.label'),
('placeReportQuantitiesNoDefault', 'Ort-Bericht-Mengen: Standard-Einheit nicht verwendet', 'Place report quantities: default unit not used', 'Quantités de rapport de lieu : unité par défaut non utilisée', 'Quantità di rapporto di luogo: unità predefinita non utilizzata', 'places', NULL, false, false, true, false, 'SELECT p.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || p.place_id || ''/place'' AS url
FROM places p
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND p.relevant_for_reports = true
  AND (p.until IS NULL
  OR p.until >= date_part(''year'', now())::integer)
  AND proj.place_reports_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM place_reports pr
JOIN place_report_quantities prq ON prq.place_report_id = pr.place_report_id
WHERE pr.place_id = p.place_id
  AND prq.unit_id != proj.place_reports_default_unit_id)
ORDER BY p.label'),
('checkQuantitiesNoDefault', 'Kontroll-Mengen: Standard-Einheit nicht verwendet', 'Check quantities: default unit not used', 'Quantités de contrôle : unité par défaut non utilisée', 'Quantità di controllo: unità predefinita non utilizzata', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/check'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND proj.checks_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM check_quantities cq
WHERE cq.check_id = c.check_id
  AND cq.unit_id != proj.checks_default_unit_id)
ORDER BY c.label'),
('checkReportQuantitiesNoDefault', 'Kontroll-Bericht-Mengen: Standard-Einheit nicht verwendet', 'Check report quantities: default unit not used', 'Quantités de rapport de contrôle : unité par défaut non utilisée', 'Quantità di rapporto di controllo: unità predefinita non utilizzata', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/check'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND proj.check_reports_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM check_reports cr
JOIN check_report_quantities crq ON crq.check_report_id = cr.check_report_id
WHERE cr.check_id = c.check_id
  AND crq.unit_id != proj.check_reports_default_unit_id)
ORDER BY c.label'),
('checkTaxonQuantitiesNoDefault', 'Kontroll-Taxon-Mengen: Standard-Einheit nicht verwendet', 'Check taxon quantities: default unit not used', 'Quantités de taxon de contrôle : unité par défaut non utilisée', 'Quantità di taxon di controllo: unità predefinita non utilizzata', 'checks', NULL, false, false, true, true, 'SELECT c.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || c.place_id || ''/checks/'' || c.check_id || ''/check'' AS url
FROM checks c
JOIN places p ON p.place_id = c.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND c.relevant_for_reports = true
  AND proj.check_taxa_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM check_taxa ct
WHERE ct.check_id = c.check_id
  AND ct.unit_id != proj.check_taxa_default_unit_id)
ORDER BY c.label'),
('actionQuantitiesNoDefault', 'Massnahmen-Mengen: Standard-Einheit nicht verwendet', 'Action quantities: default unit not used', 'Quantités d''actions : unité par défaut non utilisée', 'Quantità di azioni: unità predefinita non utilizzata', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/action'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND proj.actions_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM action_quantities aq
WHERE aq.action_id = a.action_id
  AND aq.unit_id != proj.actions_default_unit_id)
ORDER BY a.label'),
('actionReportQuantitiesNoDefault', 'Massnahmen-Bericht-Mengen: Standard-Einheit nicht verwendet', 'Action report quantities: default unit not used', 'Quantités de rapport d''actions : unité par défaut non utilisée', 'Quantità di rapporto di azioni: unità predefinita non utilizzata', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/action'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND proj.action_reports_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM action_reports ar
JOIN action_report_quantities arq ON arq.action_report_id = ar.action_report_id
WHERE ar.action_id = a.action_id
  AND arq.unit_id != proj.action_reports_default_unit_id)
ORDER BY a.label'),
('actionTaxonQuantitiesNoDefault', 'Massnahmen-Taxon-Mengen: Standard-Einheit nicht verwendet', 'Action taxon quantities: default unit not used', 'Quantités de taxon d''actions : unité par défaut non utilisée', 'Quantità di taxon di azioni: unità predefinita non utilizzata', 'actions', NULL, false, false, true, true, 'SELECT a.label, ''/data/projects/'' || sp.project_id || ''/subprojects/'' || p.subproject_id || ''/places/'' || a.place_id || ''/actions/'' || a.action_id || ''/action'' AS url
FROM actions a
JOIN places p ON p.place_id = a.place_id
JOIN subprojects sp ON sp.subproject_id = p.subproject_id
JOIN projects proj ON proj.project_id = sp.project_id
WHERE p.subproject_id = $1
  AND a.relevant_for_reports = true
  AND proj.action_taxa_default_unit_id IS NOT NULL
  AND EXISTS (SELECT 1
FROM action_taxa atx
WHERE atx.action_id = a.action_id
  AND atx.unit_id != proj.action_taxa_default_unit_id)
ORDER BY a.label')
ON CONFLICT (name) DO UPDATE SET
  label_de            = EXCLUDED.label_de,
  label_en            = EXCLUDED.label_en,
  label_fr            = EXCLUDED.label_fr,
  label_it            = EXCLUDED.label_it,
  table_name          = EXCLUDED.table_name,
  place_level         = EXCLUDED.place_level,
  is_root_level       = EXCLUDED.is_root_level,
  is_project_level    = EXCLUDED.is_project_level,
  is_subproject_level = EXCLUDED.is_subproject_level,
  filter_by_year      = EXCLUDED.filter_by_year;
  -- NOTE: sql is intentionally excluded from ON CONFLICT — it is user-edited and must not be overwritten by CSV regeneration.
