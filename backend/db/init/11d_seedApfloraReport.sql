-- yearly-report demo for the apflora example data (Aldrovanda vesiculosa):
-- the report fields, goals, an active subproject report design assembling
-- the data-driven building blocks, charts and fields, and the 2025 report.
-- Mirrors the structure of the apf2 yearly report.
BEGIN;
SET LOCAL electric.syncing TO 'true';

-- report fields (free-text sections)
INSERT INTO fields (field_id, project_id, table_name, field_type_id, widget_type_id, name, field_label) VALUES
  ('c1000000-0000-4000-8000-00000000f001', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'bemerkungen', 'Bemerkungen'),
  ('c1000000-0000-4000-8000-00000000f002', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'vergleich_ausfuehrung_planung', 'Vergleich Ausführung/Planung'),
  ('c1000000-0000-4000-8000-00000000f003', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'bemerkungen_folgerungen', 'Bemerkungen / Folgerungen für nächstes Jahr'),
  ('c1000000-0000-4000-8000-00000000f004', '0195a101-0000-7000-8000-000000000001', 'subproject_reports', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', 'einschaetzung_vorjahr', 'Vergleich zu Vorjahr - Ausblick auf Gesamtziel')
  ON CONFLICT (field_id) DO NOTHING;

-- goals of the report year (Ziele im Berichtsjahr)
INSERT INTO goals (goal_id, subproject_id, year, name, data) VALUES
  ('c2000000-0000-4000-8000-00000000a001', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 1: 14 Populationen (inkl. bestehende Populationen)',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur 10 neue Populationen"}'::jsonb),
  ('c2000000-0000-4000-8000-00000000a002', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 2: 6 neue Populationen mit mind. 1000 Triebe',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur 1 neue Population mit mind. 1000 Triebe"}'::jsonb),
  ('c2000000-0000-4000-8000-00000000a003', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 3: bestehende Populationen (Mettmenhaslisee, Mädlestenweiher): Grösse erhalten (mind. 1000 Triebe)',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur am Mettmenhaslisee konnte die Populationsgrösse erhalten werden"}'::jsonb)
  ON CONFLICT (goal_id) DO NOTHING;

-- the active report design: title, free text, the data tables and the charts
-- (chart components are named chart_<chart_id> in the design config;
-- the seeded charts are the project-level templates from 11c)
INSERT INTO subproject_report_designs (subproject_report_design_id, project_id, name, active, design) VALUES
  ('c3000000-0000-4000-8000-00000000d001', '0195a101-0000-7000-8000-000000000001', 'AP-Bericht', true,
  '{
    "content": [
      { "type": "TitleBlock", "props": { "author": "Agnes Schärer", "showDate": true } },
      { "type": "Heading", "props": { "text": "Bemerkungen" } },
      { "type": "bemerkungenField", "props": { "value": "" } },
      { "type": "Heading", "props": { "text": "A. Grundmengen" } },
      { "type": "GrundmengenTable", "props": { "title": "" } },
      { "type": "chart_a1000000-0000-4000-8000-000000000001", "props": {} },
      { "type": "Heading", "props": { "text": "B. Bestandesentwicklung" } },
      { "type": "DevelopmentTable", "props": { "title": "", "sinceYear": null } },
      { "type": "chart_a2000000-0000-4000-8000-000000000002", "props": {} },
      { "type": "Heading", "props": { "text": "C. Zwischenbilanz zur Wirkung von Massnahmen" } },
      { "type": "ActionsSummaryTable", "props": { "title": "", "sinceYear": null } },
      { "type": "Heading", "props": { "text": "Vergleich Ausführung/Planung" } },
      { "type": "vergleich_ausfuehrung_planungField", "props": { "value": "" } },
      { "type": "Heading", "props": { "text": "Bemerkungen / Folgerungen für nächstes Jahr" } },
      { "type": "bemerkungen_folgerungenField", "props": { "value": "" } },
      { "type": "Heading", "props": { "text": "D. Einschätzung der Wirkung des AP insgesamt auf die Art" } },
      { "type": "Heading", "props": { "text": "Vergleich zu Vorjahr - Ausblick auf Gesamtziel" } },
      { "type": "einschaetzung_vorjahrField", "props": { "value": "" } },
      { "type": "GoalsTable", "props": { "title": "Ziele im Berichtsjahr" } },
      { "type": "chart_a3000000-0000-4000-8000-000000000003", "props": {} }
    ],
    "root": { "props": {} }
  }'::jsonb)
  ON CONFLICT (subproject_report_design_id) DO NOTHING;
UPDATE subproject_report_designs SET active = FALSE
WHERE project_id = '0195a101-0000-7000-8000-000000000001'
  AND subproject_report_design_id <> 'c3000000-0000-4000-8000-00000000d001';

-- the 2025 report of the art, with the free-text sections
INSERT INTO subproject_reports (subproject_report_id, subproject_id, year, data) VALUES
  ('c4000000-0000-4000-8000-00000000b001', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025,
  '{
    "bemerkungen": "Die Population im Mädlestenweiher ist erstmals seit Jahren stark zurückgegangen, vermutlich wegen Karpfen und/oder Biberaktivität. In Austausch mit dem NBA wird nach Möglichkeiten gesucht, die Situation zu verbessern. Solche Massnahmen müssen von einer regelmässigen Bestandeskontrolle begleitet sein. Bei der Pflege von Kleingewässern mit Aldrovanda während der Vegetationszeit müssen alle Beteiligten über das Vorkommen der Art informiert sein.",
    "vergleich_ausfuehrung_planung": "Die Überprüfung der Meldung vom Albis und die Begleitung in Maschwanden wurden bereits 2024 abgeschlossen. Am Mädlestenweiher war bisher keine zusätzliche Begehung notwendig, da erst die Rahmenbedingungen geklärt werden mussten. Die restlichen Arbeiten gemäss Offerte konnten durchgeführt werden.",
    "bemerkungen_folgerungen": "Optimierung Massnahmen: Die Skepsis gegenüber der Förderung von Aldrovanda ist unter Botaniker:innen immer noch gross. Es wird befürchtet, dass Aldrovanda seltene Utricularia konkurrenzieren könnte, obwohl dazu keine Belege vorliegen. Diese Aversionen führen dazu, dass etliche potentiell geeignete Gewässer nicht für Ansiedlungen genutzt werden können.",
    "einschaetzung_vorjahr": "Wie bereits im Vorjahr konnte keines der Ziele erreicht werden. Mit Blick auf das Gesamtziel im Jahre 2026 sind 95% der Aktionsplan-Laufzeit verstrichen. Nur 10 der geforderten 15 Populationen sind gegründet. Die neuen Populationen sind jedoch grösstenteils noch sehr individuenschwach. Die bestehende Population am Mettmenhaslisee konnte in ihrer Grösse erhalten werden. Die Population am Mädlestenweiher ist weiterhin zu schwach."
  }'::jsonb)
  ON CONFLICT (subproject_report_id) DO NOTHING;

-- fail loudly if the report pieces are missing
DO $$
DECLARE
  got integer;
BEGIN
  SELECT count(*) INTO got FROM fields
  WHERE project_id = '0195a101-0000-7000-8000-000000000001'
    AND table_name = 'subproject_reports';
  IF got < 4 THEN
    RAISE EXCEPTION 'apflora report seed: expected 4 report fields, got %', got;
  END IF;
  SELECT count(*) INTO got FROM subproject_report_designs
  WHERE project_id = '0195a101-0000-7000-8000-000000000001' AND active;
  IF got <> 1 THEN
    RAISE EXCEPTION 'apflora report seed: expected 1 active design, got %', got;
  END IF;
  SELECT count(*) INTO got FROM subproject_reports
  WHERE subproject_id = '12496da4-f3ce-79b9-87cf-c6e85bb6722c';
  IF got < 1 THEN
    RAISE EXCEPTION 'apflora report seed: report row missing';
  END IF;
END $$;
COMMIT;
