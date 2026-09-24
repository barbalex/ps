-- yearly-report demo for the apflora example data (Aldrovanda vesiculosa):
-- the report fields (mirroring apflora's apber form), goals, an active
-- subproject report design assembling the data-driven building blocks,
-- charts and fields in the layout of the apf2 yearly report, and the 2025
-- report. Prose texts are the ones from the apf2 Aldrovanda report.
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

-- goals of the report year (Ziele im Berichtsjahr)
DELETE FROM goals
WHERE subproject_id = '12496da4-f3ce-79b9-87cf-c6e85bb6722c'
  AND year IN (2020, 2025);
-- 2020 is a demo of a past-year report: its tables/charts are calculated
-- from the historizations of that year (11b imports apf2's pop/tpop_history)
INSERT INTO goals (goal_id, subproject_id, year, name, data) VALUES
  ('c2000000-0000-4000-8000-00000000a001', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 1: 14 Populationen (inkl. bestehende Populationen)',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur 10 neue Populationen"}'::jsonb),
  ('c2000000-0000-4000-8000-00000000a002', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 2: 6 neue Populationen mit mind. 1000 Triebe',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur 1 neue Population mit mind. 1000 Triebe"}'::jsonb),
  ('c2000000-0000-4000-8000-00000000a003', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025, 'Ziel 3: bestehende Populationen (Mettmenhaslisee, Mädlestenweiher): Grösse erhalten (mind. 1000 Triebe)',
    '{"typ":"Zwischenziel","beurteilung":"nicht erreicht; nur am Mettmenhaslisee konnte die Populationsgrösse erhalten werden"}'::jsonb)
  ON CONFLICT (goal_id) DO NOTHING;

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
      "type": "beurteilungsskalaField",
      "props": {
        "id": "beurteilungsskalaField-19"
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

-- the 2025 report of the art, with the free-text sections
DELETE FROM subproject_reports
WHERE subproject_id = '12496da4-f3ce-79b9-87cf-c6e85bb6722c'
  AND year IN (2020, 2025);
-- 2020 is a demo of a past-year report: its tables/charts are calculated
-- from the historizations of that year (11b imports apf2's pop/tpop_history)
INSERT INTO subproject_reports (subproject_report_id, subproject_id, year, data) VALUES
  ('c4000000-0000-4000-8000-00000000b001', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2025,
  '{
  "biotope_neue": "Geeignete Gewässer sind nach wie vor Mangelware und werden teilweise durch seltene Utricularia-Arten besiedelt, sodass dort i.d.R. von einer Ansiedlung von Aldrovanda abgesehen wird (auch wenn der negative Effekt nicht belegt ist). Neu eröffnete oder abgetiefte Moorgewässer sollten für Ansiedlungen genutzt werden können, in Absprache mit den Utricularia-AV. Ganz \"leere\" Gewässer scheinen jedoch nicht ideal; während mehrerer Jahre nachpflanzen, da \"Wintersterblichkeit\" und Zufallseffekte vermutlich gross. Auch oligotrophe Gewässer ausserhalb von Mooren können geeignet sein.",
  "biotope_optimieren": "Eine \"alte\" Population im Kt. ZH, in der die Art Jahrzehnte mit tausenden Individuen vorkam, ist 2023 zusammengebrochen, vermutlich wegen Karpfen und/oder Biberaktivität. In Austausch mit dem NBA wird nach Möglichkeiten gesucht, die Situation zu verbessern.",
  "vergleich_ausfuehrung_planung": "Die Überprüfung der Meldung vom Albis und die Begleitung in Maschwanden wurden bereits 2024 abgeschlossen. Am Mädlestenweiher war bisher keine zusätzliche Begehung notwendig, da erst die Rahmenbedingungen geklärt werden mussten. Die restlichen Arbeiten gemäss Offerte konnten durchgeführt werden.",
  "massnahmen_optimieren": "Die Skepsis gegenüber der Förderung von Aldrovanda ist unter Botaniker:innen immer noch gross. Es wird befürchtet, dass Aldrovanda seltene Utricularia konkurrenzieren könnte, obwohl dazu in der Literatur keine Belege oder Hinweise vorliegen. Diese Aversionen führen dazu, dass etliche potentiell geeignete Gewässer nicht für Ansiedlungen genutzt werden können und die Umsetzung des Aktionsplans verzögert wird. Das Ansiedeln einer möglichst grossen Zahl von Trieben oder Turionen scheint wichtig zu sein, um Effekte durch die \"Wintermortalität\" zu kompensieren. Es sollten daher in angesiedelten Teil-Populationen mehrere Jahre Nachpflanzungen erfolgen.",
  "massnahmen_ap_bearb": "",
  "vergleich_vorjahr_gesamtziel": "Wie bereits im Vorjahr konnte keines der Ziele erreicht werden. Mit Blick auf das Gesamtziel im Jahre 2026 sind 95% der Aktionsplan-Laufzeit verstrichen. Nur 10 der geforderten 15 Populationen sind gegründet. Die neuen Populationen sind jedoch grösstenteils noch sehr individuenschwach. Die bestehende Population am Mettmenhaslisee konnte in ihrer Grösse erhalten werden. Die Population am Mädlestenweiher ist weiterhin zu schwach.",
  "beurteilungsskala": "sehr erfolgreich: 3 Ziele wurden erreicht; erfolgreich: 2 Ziele wurden erreicht; mässig erfolgreich: 1 Ziel wurde erreicht; nicht erfolgreich: kein Ziel wurde erreicht",
  "beurteilung": "nicht erfolgreich",
  "wirkung_auf_art": "Ohne den Aktionsplan wäre diese Art im Kanton Zürich nur noch an 2 Wuchsorten erhalten geblieben (wobei der eine langjährige Bestand inzwischen unerwartet zusammengebrochen ist). Durch den Aktionsplan konnten einige Populationen neu angesiedelt werden, die langfristige Vitalität und Entwicklung dieser Populationen ist jedoch noch sehr ungewiss.",
  "apber_analyse": "Die ursprünglichen Vorkommen im deutschen und österreichischen Bodenseeraum, von denen die Zürcher Populationen abstammen, sind alle erloschen. Gründe dafür sind Management-Fehler und Nährstoffeintrag resp. Landschafts- und Vegetationsveränderungen. Diese Herkunft existiert jetzt nur noch angesiedelt im Kt. Zürich. Allerdings ist eines der beiden grossen und langjährigen Vorkommen mit mehreren Tausend Trieben unerwartet zusammengebrochen. Als Grund werden Karpfen und/oder der Biber vermutet. Das verbliebene grosse Zürcher Vorkommen ist daher besonders wertvoll und schützenswert! Wie das Beispiel von Aldrovanda zeigt, ist selbst bei einer sehr grossen und jahrzehntelang existierenden Population nicht garantiert, dass sie nicht plötzlich verschwinden kann. Durch das Etablieren weiterer stabiler und individuenstarker Vorkommen muss das Risiko verkleinert werden, dass Aldrovanda im Raum Bodensee/Zürich ganz verschwindet, falls beim letzten grossen Vorkommen ebenfalls ein Problem auftreten sollte.",
  "konsequenzen_umsetzung": "In der Vergangenheit wurde oft beobachtet, dass Ansiedlungen von Aldrovanda entweder gar nicht funktionierten oder nach wenigen Jahren wieder erlöschen. Die Gründe dafür blieben meist unklar, allenfalls wurden jeweils zu wenige Individuen angesiedelt, sodass die Wintermortalität und der Zufall eine Rolle spielten. Dank stabiler Grösse kann nun jedoch ein grosses Vorkommen als Spenderpopulation genutzt und Neugründungen mit vergleichsweise vielen Individuen vorgenommen werden. Diese Strategie wird fortgesetzt. Momentan werden Neugründungen wenn möglich nicht in Gewässern vorgenommen, in denen bereits sehr seltene Utricularia-Arten vorkommen. Neue Ansiedlungsgewässer zu finden ist schwierig, da diese erstens oft nicht in der Liste mit Neuschaffungsflächen erscheinen und zweitens neuen Moortümpeln oft anderen seltenen Wasserpflanzen vorbehalten sind. Grundsätzlich scheint nach der Neuanlage oder dem Ausbaggern von Moorgewässern ein Nachpflanzen über mehrere Jahre nötig, da sich vermutlich ganz \"leere\" Gewässer nicht für Aldrovanda eignen.",
  "konsequenzen_erfolgskontrolle": "Eine Erfolgskontrolle ist bei Aldrovanda vesiculosa teilweise aus logistischen Gründen schwierig, denn das Betreten von Feuchtgebieten ist im Frühling (wenn das Schilf noch kurz ist) oft nicht gestattet wegen störungsanführiger Brutvögel. Nach der Brutsaison im Hochsommer steht das Schilf jedoch meist so hoch, dass das Auffinden der Kleingewässer bzw. die Orientierung im Ried sehr schwierig wird. Daher finden Erfolgskontrollen oft erst im September statt, nachdem der Riedschnitt begonnen hat."
}'::jsonb),
  ('c4000000-0000-4000-8000-00000000b002', '12496da4-f3ce-79b9-87cf-c6e85bb6722c', 2020,
  '{
  "biotope_neue": "(2020) Zahlreiche Neuansiedlungen konnten in den Vorjahren vorgenommen werden; die Entwicklung der jungen Populationen wird weiter verfolgt.",
  "biotope_optimieren": "(2020) Die Bestandeskontrollen der bestehenden Gewässer laufen; erste Optimierungen der Habitatbedingungen wurden umgesetzt.",
  "vergleich_ausfuehrung_planung": "(2020) Die geplanten Arbeiten wurden weitgehend wie vorgesehen umgesetzt.",
  "massnahmen_optimieren": "(2020) Die Ansiedlungen der letzten Jahre entwickeln sich mehrheitlich vielversprechend; Nachpflanzungen werden fortgesetzt.",
  "massnahmen_ap_bearb": "",
  "vergleich_vorjahr_gesamtziel": "(2020) Mit den Neuansiedlungen der letzten Jahre wurden erste Schritte in Richtung Gesamtziel gemacht.",
  "beurteilungsskala": "sehr erfolgreich: 3 Ziele wurden erreicht; erfolgreich: 2 Ziele wurden erreicht; mässig erfolgreich: 1 Ziel wurde erreicht; nicht erfolgreich: kein Ziel wurde erreicht",
  "beurteilung": "erfolgreich",
  "wirkung_auf_art": "(2020) Ohne den Aktionsplan wäre die Art im Kanton Zürich nur noch an zwei Wuchsorten vorhanden. Die neu begründeten Populationen sind noch klein, aber etabliert.",
  "apber_analyse": "(2020) Die Ansiedlungserfolge der Jahre seit Projektbeginn zeigen, dass die gewählte Methode grundsätzlich funktioniert.",
  "konsequenzen_umsetzung": "(2020) Die Nachpflanzungen werden wie geplant weitergeführt.",
  "konsequenzen_erfolgskontrolle": "(2020) Die Erfolgskontrollen werden im jährlichen Rhythmus fortgesetzt."
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
  IF got < 12 THEN
    RAISE EXCEPTION 'apflora report seed: expected 12 report fields, got %', got;
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
