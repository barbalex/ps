-- yearly-report demo for the apflora example data (Abies alba):
-- the report fields (mirroring apflora's apber form), goals, an active
-- subproject report design assembling the data-driven building blocks,
-- charts and fields in the layout of the apf2 yearly report, and the 2025
-- report. Prose texts are the ones from the apf2 yearly report (originally
-- Aldrovanda vesiculosa's).
BEGIN;
SET LOCAL electric.syncing TO 'true';

-- report fields (free-text sections, apf2 apber form field set).
-- NB: rows are deleted first because the sync duplicate-guard triggers
-- silently ignore inserts of existing rows while electric.syncing is set —
-- ON CONFLICT DO UPDATE would never fire
DELETE FROM fields
WHERE project_id = '0195a101-0000-7000-8000-000000000001'
  AND table_name = 'subproject_reports';
INSERT INTO fields (field_id, project_id, table_name, field_type_id, widget_type_id, name, field_label) VALUES
  ('c1000000-0000-4000-8000-00000000f011', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'biotope_neue', 'Bemerkungen / Folgerungen für nächstes Jahr: neue Biotope'),
  ('c1000000-0000-4000-8000-00000000f012', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'biotope_optimieren', 'Bemerkungen / Folgerungen für nächstes Jahr: Optimierung Biotope'),
  ('c1000000-0000-4000-8000-00000000f002', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'vergleich_ausfuehrung_planung', 'Vergleich Ausführung/Planung'),
  ('c1000000-0000-4000-8000-00000000f013', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'massnahmen_optimieren', 'Bemerkungen / Folgerungen für nächstes Jahr: Optimierung Massnahmen'),
  ('c1000000-0000-4000-8000-00000000f014', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'massnahmen_ap_bearb', 'Weitere Aktivitäten der Art-Verantwortlichen'),
  ('c1000000-0000-4000-8000-00000000f004', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'vergleich_vorjahr_gesamtziel', 'Vergleich zu Vorjahr - Ausblick auf Gesamtziel'),
  ('c1000000-0000-4000-8000-00000000f015', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'beurteilungsskala', 'Beurteilungsskala'),
  ('c1000000-0000-4000-8000-00000000f016', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'beurteilung', 'Beurteilung'),
  ('c1000000-0000-4000-8000-00000000f017', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'wirkung_auf_art', 'Bemerkungen zur Einschätzung'),
  ('c1000000-0000-4000-8000-00000000f018', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'apber_analyse', 'Analyse'),
  ('c1000000-0000-4000-8000-00000000f019', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'konsequenzen_umsetzung', 'Konsequenzen für die Umsetzung'),
  ('c1000000-0000-4000-8000-00000000f01a', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'konsequenzen_erfolgskontrolle', 'Konsequenzen für die Erfolgskontrolle')
;

-- project report field: the Zusammenfassung of the yearly report
-- (apf2 apberuebersicht.bemerkungen); rendered directly in the report print
INSERT INTO fields (field_id, project_id, table_name, field_type_id, widget_type_id, name, field_label) VALUES
  ('c1000000-0000-4000-8000-00000000f101', '0195a101-0000-7000-8000-000000000001', 'project_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'zusammenfassung', 'Zusammenfassung')
ON CONFLICT (field_id) DO NOTHING;

-- the active report design: title, fields, the data tables and the charts,
-- in the layout of the apf2 yearly report
DELETE FROM subproject_report_designs
WHERE project_id = '0195a101-0000-7000-8000-000000000001';
INSERT INTO subproject_report_designs (subproject_report_design_id, project_id, name, active, design) VALUES
  ('c3000000-0000-4000-8000-00000000d001', '0195a101-0000-7000-8000-000000000001', 'AP-Bericht', true,
  '{
  "content": [
    {
      "type": "TitleBlock",
      "props": {
        "id": "TitleBlock-0",
        "author": "Agnes Schärer",
        "showDate": true
      }
    },
    {
      "type": "ProgrammInfo",
      "props": {
        "id": "ProgrammInfo-25"
      }
    },
    {
      "type": "Heading",
      "props": {
        "id": "Heading-1",
        "text": "A. Grundmengen"
      }
    },
    {
      "type": "GrundmengenTable",
      "props": {
        "id": "GrundmengenTable-2",
        "title": ""
      }
    },
    {
      "type": "biotope_neueField",
      "props": {
        "id": "biotope_neueField-3"
      }
    },
    {
      "type": "Heading",
      "props": {
        "id": "Heading-4",
        "text": "B. Bestandesentwicklung"
      }
    },
    {
      "type": "DevelopmentTable",
      "props": {
        "id": "DevelopmentTable-5",
        "title": "",
        "sinceYear": null
      }
    },
    {
      "type": "chart_a1000000-0000-4000-8000-000000000001",
      "props": {
        "id": "chart_a1000000-0000-4000-8000-000000000001-6"
      }
    },
    {
      "type": "chart_a2000000-0000-4000-8000-000000000002",
      "props": {
        "id": "chart_a2000000-0000-4000-8000-000000000002-7"
      }
    },
    {
      "type": "chart_a3000000-0000-4000-8000-000000000003",
      "props": {
        "id": "chart_a3000000-0000-4000-8000-000000000003-8"
      }
    },
    {
      "type": "biotope_optimierenField",
      "props": {
        "id": "biotope_optimierenField-9"
      }
    },
    {
      "type": "Heading",
      "props": {
        "id": "Heading-10",
        "text": "C. Zwischenbilanz zur Wirkung von Massnahmen"
      }
    },
    {
      "type": "ActionsSummaryTable",
      "props": {
        "id": "ActionsSummaryTable-11",
        "title": "",
        "sinceYear": null
      }
    },
    {
      "type": "vergleich_ausfuehrung_planungField",
      "props": {
        "id": "vergleich_ausfuehrung_planungField-12"
      }
    },
    {
      "type": "massnahmen_optimierenField",
      "props": {
        "id": "massnahmen_optimierenField-13"
      }
    },
    {
      "type": "massnahmen_ap_bearbField",
      "props": {
        "id": "massnahmen_ap_bearbField-14"
      }
    },
    {
      "type": "MassnahmenList",
      "props": {
        "id": "MassnahmenList-15",
        "title": "Massnahmen im Berichtsjahr:"
      }
    },
    {
      "type": "Heading",
      "props": {
        "id": "Heading-16",
        "text": "D. Einschätzung der Wirkung des AP insgesamt auf die Art"
      }
    },
    {
      "type": "vergleich_vorjahr_gesamtzielField",
      "props": {
        "id": "vergleich_vorjahr_gesamtzielField-17"
      }
    },
    {
      "type": "GoalsTable",
      "props": {
        "id": "GoalsTable-18",
        "title": "Ziele im Berichtsjahr"
      }
    },
    {
      "type": "Beurteilungsskala",
      "props": {
        "id": "Beurteilungsskala-26"
      }
    },
    {
      "type": "beurteilungField",
      "props": {
        "id": "beurteilungField-20"
      }
    },
    {
      "type": "wirkung_auf_artField",
      "props": {
        "id": "wirkung_auf_artField-21"
      }
    },
    {
      "type": "apber_analyseField",
      "props": {
        "id": "apber_analyseField-22"
      }
    },
    {
      "type": "konsequenzen_umsetzungField",
      "props": {
        "id": "konsequenzen_umsetzungField-23"
      }
    },
    {
      "type": "konsequenzen_erfolgskontrolleField",
      "props": {
        "id": "konsequenzen_erfolgskontrolleField-24"
      }
    }
  ],
  "root": {
    "props": {}
  }
}'::jsonb)
  ON CONFLICT (subproject_report_design_id) DO NOTHING;

-- fail loudly if the report pieces are missing
DO $$
DECLARE
  got integer;
BEGIN
  SELECT count(*) INTO got FROM fields
  WHERE project_id = '0195a101-0000-7000-8000-000000000001'
    AND table_name = 'subproject_reports';
  IF got < 12 THEN
    RAISE EXCEPTION 'apflora report seed: expected 12 report fields, got %', got;
  END IF;
  SELECT count(*) INTO got FROM fields
  WHERE project_id = '0195a101-0000-7000-8000-000000000001'
    AND table_name = 'project_reports';
  IF got < 1 THEN
    RAISE EXCEPTION 'apflora report seed: expected 1 project report field, got %', got;
  END IF;
  SELECT count(*) INTO got FROM subproject_report_designs
  WHERE project_id = '0195a101-0000-7000-8000-000000000001' AND active;
  IF got <> 1 THEN
    RAISE EXCEPTION 'apflora report seed: expected 1 active design, got %', got;
  END IF;
  SELECT count(*) INTO got FROM subproject_reports
  WHERE subproject_id = '655ecc9b-43ef-706f-84ae-19ef5c6387cb';
  IF got < 1 THEN
    RAISE EXCEPTION 'apflora report seed: report row missing';
  END IF;
END $$;
COMMIT;
