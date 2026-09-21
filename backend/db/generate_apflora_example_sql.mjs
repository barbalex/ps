#!/usr/bin/env node
// Regenerates backend/db/init/11b_seedApfloraExampleData.sql
// from seed-data/apflora/apf2-example.json (created by extract_apflora_example.mjs).
// Run from the project root: node backend/db/generate_apflora_example_sql.mjs
//
// Maps apf2 (apflora.ch) example data to ps:
//   ap (per species)     -> subprojects
//   pop                  -> places level 1 (Populationen)
//   tpop                 -> places level 2 (Teil-Populationen)
//   tpopkontr (EK + Ausgangszustand) -> checks, apf2 columns -> checks.data (fields)
//   tpopkontrzaehl       -> check_taxa (taxon resolved via DB-TAXREF (2017) taxa)
//   tpopmassn            -> actions, apf2 columns -> actions.data (fields)
// Taxa are NOT imported: 11a_seedApfloraTaxonomies.sql already seeds
// DB-TAXREF (2017); this file links into it by id_in_source (taxid).
//
// All generated ids are deterministic (md5-derived uuidv7-shaped),
// so regenerating produces stable ids and the seed is idempotent
// (ON CONFLICT DO NOTHING) and assert-guarded.

import { createHash } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const jsonPath = join(projectRoot, 'seed-data', 'apflora', 'apf2-example.json')
// numbered to run after 11a_seedApfloraTaxonomies.sql (which provides the
// DB-TAXREF taxa) and before 12_writePermissionTriggers.sql (which would
// reject these inserts without a JWT session)
const sqlPath = join(
  projectRoot,
  'backend',
  'db',
  'init',
  '11b_seedApfloraExampleData.sql',
)

// demo account from 10_seedGeneralTestData.sql; the projects insert owner
// trigger grants it the 'own' role automatically
const ACCOUNT_ID = '018cf958-27e2-7000-90d3-59f024d467be'
const PROJECT_ID = '0195a101-0000-7000-8000-000000000001'
const PLACE_LEVEL_1_ID = '0195a101-0000-7000-8000-000000000002'
const PLACE_LEVEL_2_ID = '0195a101-0000-7000-8000-000000000003'
const TAXONOMY_NAME = 'DB-TAXREF (2017)'

// field_type / widget_type ids from 10_seedGeneralTestData.sql
const FIELD_TYPE = {
  text: '018ca19e-7a23-7bf4-8523-ff41e3b60807',
  boolean: '018ca19f-2923-7ae5-9ae6-a5c81ab65042',
  integer: '018ca19f-3ec9-7dab-b77a-bb20ea7d188b',
  decimal: '018ca19f-51ef-7c43-bc3f-e87e259b742b',
}
const WIDGET = {
  text: '018ca1a0-f187-7fdf-955b-4eaadaa92553',
  textarea: '018ca1a1-0868-7f1e-80aa-119fa3932538',
  jesNo: '018ca1a1-f095-7fa2-8935-3abe52ee718d',
  optionsFew: '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe',
  optionsMany: '018ca1a1-c94b-7d29-b21c-42053ade0411',
}

const data = JSON.parse(readFileSync(jsonPath, 'utf8'))

// deterministic uuidv7-shaped id; version/variant nibbles forced to 7/8
const derivedId = (kind, key) => {
  const h = createHash('md5')
    .update(`apflora-example:${kind}:${key}`)
    .digest('hex')
  const u = `${h.slice(0, 12)}7${h.slice(13, 16)}8${h.slice(17, 32)}`
  return `${u.slice(0, 8)}-${u.slice(8, 12)}-${u.slice(12, 16)}-${u.slice(16, 20)}-${u.slice(20, 32)}`
}

const q = (s) => `'${String(s).replaceAll("'", "''")}'`
const numOrNull = (n) => (n === null || n === undefined ? 'null' : String(n))
const qOrNull = (s) => (s === null || s === undefined ? 'null' : q(s))
const boolOrNull = (b) =>
  b === null || b === undefined ? 'null' : b ? 'true' : 'false'
const intOrNull = (n) => (n === null || n === undefined ? 'null' : String(parseInt(n, 10)))
const jsonbOrNull = (obj) =>
  obj === null || Object.keys(obj).length === 0
    ? 'null'
    : `'${JSON.stringify(obj).replaceAll("'", "''")}'::jsonb`
const geomOrNull = (point) =>
  point
    ? `ST_GeomFromGeoJSON('${JSON.stringify({
        type: 'GeometryCollection',
        geometries: [point],
      })}')`
    : 'null'

const werteText = (liste, code) => {
  if (code === null || code === undefined) return null
  const entry = data.werte[liste].find((w) => parseInt(w.code, 10) === code)
  return entry ? entry.text : null
}

const adressName = (id) => {
  const a = data.adressen.find((x) => x.id === id)
  return a ? a.name : null
}

// ---- lists (options for fields) -----------------------------------------
// [list key, name, werte source, allowed codes (null = all, sorted by werte.sort)]
const listDefs = [
  ['kontrolltyp', 'Kontrolltyp', 'typ', ['Ausgangszustand', 'Kontrolle']],
  ['entwicklung', 'Entwicklung', 'entwicklung', null],
  ['popstatus', 'Populationsstatus', 'popStatus', null],
  ['idbiotuebereinst', 'Übereinstimmung mit Idealbiotop', 'idbiotuebereinst', null],
  ['apbearbstand', 'Bearbeitungsstand', 'apBearbstand', null],
  ['apumsetzung', 'Umsetzung', 'apUmsetzung', null],
  ['apbergrund', 'AP-Bericht relevant: Grund', 'apberRelevantGrund', null],
  ['massntyp', 'Massnahmen: Typ', 'massnTyp', null],
  ['zaehleinheit', 'Zaehleinheit', 'einheit', null],
]
const listId = (key) => derivedId('list', key)
const listValueId = (key, value) => derivedId('list_value', `${key}:${value}`)

// ---- units (from zaehl einheiten actually used) --------------------------
const einheitCounts = new Map()
for (const art of data.arts) {
  for (const pop of art.pops) {
    for (const tpop of pop.tpops) {
      for (const kontr of tpop.kontrollen) {
        for (const z of kontr.zaehl) {
          if (z.anzahl === null) continue
          if (z.einheit === null) continue
          einheitCounts.set(z.einheit, (einheitCounts.get(z.einheit) ?? 0) + 1)
        }
      }
    }
  }
}
const unitId = (einheit) => derivedId('unit', `einheit:${einheit}`)
const defaultUnitEinheit = [...einheitCounts.entries()].sort(
  (a, b) => b[1] - a[1],
)[0][0]

// ---- fields --------------------------------------------------------------
// name = jsonb key in data; option fields carry their list key
const fieldDefs = [
  // table_name, level, name, label, field type, widget, list key (or null)
  ['checks', 2, 'typ', 'Typ', 'text', 'optionsFew', 'kontrolltyp'],
  ['checks', 2, 'bearbeiter', 'Bearbeiter/in', 'text', 'text', null],
  ['checks', 2, 'vitalitaet', 'Vitalität', 'text', 'text', null],
  ['checks', 2, 'ueberlebensrate', 'Überlebensrate (%)', 'integer', 'text', null],
  ['checks', 2, 'entwicklung', 'Entwicklung', 'text', 'optionsFew', 'entwicklung'],
  ['checks', 2, 'ursachen', 'Ursachen', 'text', 'textarea', null],
  ['checks', 2, 'erfolgsbeurteilung', 'Erfolgsbeurteilung', 'text', 'textarea', null],
  ['checks', 2, 'umsetzung_aendern', 'Änderung Umsetzung', 'text', 'textarea', null],
  ['checks', 2, 'kontrolle_aendern', 'Änderung Kontrolle', 'text', 'textarea', null],
  ['checks', 2, 'plan_vorhanden', 'Plan vorhanden', 'boolean', 'jesNo', null],
  ['checks', 2, 'flaeche', 'Fläche (m²)', 'integer', 'text', null],
  ['checks', 2, 'flaeche_ueberprueft', 'Fläche überprüft', 'boolean', 'jesNo', null],
  ['checks', 2, 'lr_delarze', 'Lebensraum (Delarze)', 'text', 'text', null],
  ['checks', 2, 'lr_umgebung_delarze', 'Lebensraum Umgebung (Delarze)', 'text', 'text', null],
  ['checks', 2, 'vegetationstyp', 'Vegetationstyp', 'text', 'text', null],
  ['checks', 2, 'konkurrenz', 'Konkurrenz', 'text', 'text', null],
  ['checks', 2, 'moosschicht', 'Moosschicht', 'text', 'text', null],
  ['checks', 2, 'krautschicht', 'Krautschicht', 'text', 'text', null],
  ['checks', 2, 'strauchschicht', 'Strauchschicht', 'text', 'text', null],
  ['checks', 2, 'baumschicht', 'Baumschicht', 'text', 'text', null],
  ['checks', 2, 'idealbiotop_uebereinstimmung', 'Übereinstimmung mit Idealbiotop', 'text', 'optionsFew', 'idbiotuebereinst'],
  ['checks', 2, 'handlungsbedarf', 'Handlungsbedarf', 'text', 'textarea', null],
  ['checks', 2, 'deckung_vegetation', 'Deckung Vegetation (%)', 'integer', 'text', null],
  ['checks', 2, 'deckung_nackter_boden', 'Deckung nackter Boden (%)', 'integer', 'text', null],
  ['checks', 2, 'deckung_ap_art', 'Deckung AP-Art (%)', 'integer', 'text', null],
  ['checks', 2, 'jungpflanzen_vorhanden', 'Jungpflanzen vorhanden', 'boolean', 'jesNo', null],
  ['checks', 2, 'vegetationshoehe_maximum', 'Vegetationshöhe maximal (cm)', 'integer', 'text', null],
  ['checks', 2, 'vegetationshoehe_mittel', 'Vegetationshöhe mittel (cm)', 'integer', 'text', null],
  ['checks', 2, 'gefaehrdung', 'Gefährdung', 'text', 'textarea', null],
  ['checks', 2, 'apber_nicht_relevant', 'Für AP-Bericht nicht relevant', 'boolean', 'jesNo', null],
  ['checks', 2, 'apber_nicht_relevant_grund', 'Grund: für AP-Bericht nicht relevant', 'text', 'text', null],
  // tpopmassn -> actions level 2
  ['actions', 2, 'typ', 'Typ', 'text', 'optionsMany', 'massntyp'],
  ['actions', 2, 'beschreibung', 'Beschreibung', 'text', 'textarea', null],
  ['actions', 2, 'bearbeiter', 'Bearbeiter/in', 'text', 'text', null],
  ['actions', 2, 'flaeche', 'Fläche (m²)', 'decimal', 'text', null],
  ['actions', 2, 'plan_vorhanden', 'Plan vorhanden', 'boolean', 'jesNo', null],
  ['actions', 2, 'plan_bezeichnung', 'Plan: Bezeichnung', 'text', 'text', null],
  ['actions', 2, 'markierung', 'Markierung', 'text', 'text', null],
  ['actions', 2, 'anz_pflanzen', 'Anzahl Pflanzen', 'integer', 'text', null],
  ['actions', 2, 'anz_triebe', 'Anzahl Triebe', 'integer', 'text', null],
  ['actions', 2, 'anz_pflanzstellen', 'Anzahl Pflanzstellen', 'integer', 'text', null],
  ['actions', 2, 'zieleinheit_anzahl', 'Zieleinheit: Anzahl', 'integer', 'text', null],
  ['actions', 2, 'zieleinheit_einheit', 'Zieleinheit: Einheit', 'text', 'optionsMany', 'zaehleinheit'],
  ['actions', 2, 'von_anzahl_individuen', 'Anzahl Individuen (Herkunft)', 'integer', 'text', null],
  ['actions', 2, 'herkunft_pop', 'Herkunft: Population', 'text', 'text', null],
  ['actions', 2, 'wirtspflanze', 'Wirtspflanze', 'text', 'text', null],
  ['actions', 2, 'sammeldatum', 'Sammeldatum', 'text', 'text', null],
  ['actions', 2, 'form', 'Form', 'text', 'text', null],
  ['actions', 2, 'pflanzanordnung', 'Pflanzanordnung', 'text', 'text', null],
  ['actions', 2, 'bemerkungen', 'Bemerkungen', 'text', 'textarea', null],
  // pop -> places level 1
  ['places', 1, 'status', 'Status', 'text', 'optionsFew', 'popstatus'],
  ['places', 1, 'status_unklar', 'Status unklar', 'boolean', 'jesNo', null],
  ['places', 1, 'status_unklar_begruendung', 'Begründung: Status unklar', 'text', 'textarea', null],
  // tpop -> places level 2
  ['places', 2, 'gemeinde', 'Gemeinde', 'text', 'text', null],
  ['places', 2, 'radius', 'Radius (m)', 'integer', 'text', null],
  ['places', 2, 'hoehe', 'Höhe (m ü. M.)', 'integer', 'text', null],
  ['places', 2, 'exposition', 'Exposition', 'text', 'text', null],
  ['places', 2, 'klima', 'Klima', 'text', 'text', null],
  ['places', 2, 'neigung', 'Neigung', 'text', 'text', null],
  ['places', 2, 'boden_typ', 'Bodentyp', 'text', 'text', null],
  ['places', 2, 'boden_kalkgehalt', 'Boden: Kalkgehalt', 'text', 'text', null],
  ['places', 2, 'boden_durchlaessigkeit', 'Boden: Durchlässigkeit', 'text', 'text', null],
  ['places', 2, 'boden_humus', 'Boden: Humus', 'text', 'text', null],
  ['places', 2, 'boden_naehrstoffgehalt', 'Boden: Nährstoffgehalt', 'text', 'text', null],
  ['places', 2, 'boden_abtrag', 'Boden: Abtrag', 'text', 'text', null],
  ['places', 2, 'wasserhaushalt', 'Wasserhaushalt', 'text', 'text', null],
  ['places', 2, 'beschreibung', 'Beschreibung', 'text', 'textarea', null],
  ['places', 2, 'kataster_nr', 'Kataster-Nr.', 'text', 'text', null],
  ['places', 2, 'status', 'Status', 'text', 'optionsFew', 'popstatus'],
  ['places', 2, 'status_unklar', 'Status unklar', 'boolean', 'jesNo', null],
  ['places', 2, 'status_unklar_grund', 'Grund: Status unklar', 'text', 'textarea', null],
  ['places', 2, 'apber_relevant', 'Für AP-Bericht relevant', 'boolean', 'jesNo', null],
  ['places', 2, 'apber_relevant_grund', 'Grund: für AP-Bericht nicht relevant', 'text', 'optionsFew', 'apbergrund'],
  ['places', 2, 'eigentuemer', 'Eigentümer/in', 'text', 'text', null],
  ['places', 2, 'kontakt', 'Kontakt vor Ort', 'text', 'text', null],
  ['places', 2, 'nutzungszone', 'Nutzungszone', 'text', 'text', null],
  ['places', 2, 'bewirtschafter', 'Bewirtschafter/in', 'text', 'text', null],
  ['places', 2, 'bewirtschaftung', 'Bewirtschaftung', 'text', 'textarea', null],
  ['places', 2, 'ekfrequenz_startjahr', 'EK-Frequenz: Startjahr', 'integer', 'text', null],
  ['places', 2, 'ekfrequenz_abweichend', 'EK-Frequenz abweichend', 'boolean', 'jesNo', null],
  ['places', 2, 'ekf_kontrolleur', 'EK-Kontrolleur/in', 'text', 'text', null],
  ['places', 2, 'bemerkungen', 'Bemerkungen', 'text', 'textarea', null],
  // ap -> subprojects
  ['subprojects', null, 'bearbeitung', 'Bearbeitungsstand', 'text', 'optionsFew', 'apbearbstand'],
  ['subprojects', null, 'umsetzung', 'Umsetzung', 'text', 'optionsFew', 'apumsetzung'],
  ['subprojects', null, 'bearbeiter', 'Bearbeiter/in', 'text', 'text', null],
  ['subprojects', null, 'ekf_beobachtungszeitpunkt', 'EK-Beobachtungszeitpunkt', 'text', 'text', null],
]
const fieldId = (table, level, name) =>
  derivedId('field', `${table}:${level ?? 'x'}:${name}`)

// ---- row builders ---------------------------------------------------------
const out = []
const emit = (s) => out.push(s)

const place1Id = (popId) => derivedId('place1', popId)
const place2Id = (tpopId) => derivedId('place2', tpopId)
const checkId = (kontrId) => derivedId('check', kontrId)
const checkTaxonId = (zaehlId) => derivedId('check_taxon', zaehlId)
const actionId = (massnId) => derivedId('action', massnId)
const subprojectId = (apId) => derivedId('subproject', apId)

// apf2 pop/tpop label convention: nr + name/flurname
const popName = (pop) => [pop.nr, pop.name].filter((x) => x !== null && x !== '').join(' ')
const tpopName = (tpop) =>
  [tpop.nr, tpop.flurname || tpop.gemeinde].filter((x) => x !== null && x !== '').join(' ')

// non-null jsonb data per row: [key, value] pairs, null values dropped
const buildData = (entries) => {
  const obj = {}
  for (const [key, value] of entries) {
    if (value !== null && value !== undefined && value !== '') obj[key] = value
  }
  return Object.keys(obj).length ? obj : null
}

const places1 = []
const places2 = []
const checks = []
const actions = []
const checkTaxaByArt = new Map() // art index -> rows

data.arts.forEach((art, artIndex) => {
  for (const pop of art.pops) {
    places1.push({
      id: place1Id(pop.id),
      subproject: subprojectId(art.ap.id),
      name: popName(pop),
      since: pop.bekannt_seit,
      geometry: pop.geom_point,
      data: buildData([
        ['status', werteText('popStatus', pop.status)],
        ['status_unklar', pop.status_unklar],
        ['status_unklar_begruendung', pop.status_unklar_begruendung],
      ]),
    })
    for (const tpop of pop.tpops) {
      places2.push({
        id: place2Id(tpop.id),
        parent: place1Id(pop.id),
        subproject: subprojectId(art.ap.id),
        name: tpopName(tpop),
        since: tpop.bekannt_seit,
        geometry: tpop.geom_point,
        data: buildData([
          ['gemeinde', tpop.gemeinde],
          ['radius', tpop.radius],
          ['hoehe', tpop.hoehe],
          ['exposition', tpop.exposition],
          ['klima', tpop.klima],
          ['neigung', tpop.neigung],
          ['boden_typ', tpop.boden_typ],
          ['boden_kalkgehalt', tpop.boden_kalkgehalt],
          ['boden_durchlaessigkeit', tpop.boden_durchlaessigkeit],
          ['boden_humus', tpop.boden_humus],
          ['boden_naehrstoffgehalt', tpop.boden_naehrstoffgehalt],
          ['boden_abtrag', tpop.boden_abtrag],
          ['wasserhaushalt', tpop.wasserhaushalt],
          ['beschreibung', tpop.beschreibung],
          ['kataster_nr', tpop.kataster_nr],
          ['status', werteText('popStatus', tpop.status)],
          ['status_unklar', tpop.status_unklar],
          ['status_unklar_grund', tpop.status_unklar_grund],
          ['apber_relevant', tpop.apber_relevant],
          ['apber_relevant_grund', werteText('apberRelevantGrund', tpop.apber_relevant_grund)],
          ['eigentuemer', tpop.eigentuemer],
          ['kontakt', tpop.kontakt],
          ['nutzungszone', tpop.nutzungszone],
          ['bewirtschafter', tpop.bewirtschafter],
          ['bewirtschaftung', tpop.bewirtschaftung],
          ['ekfrequenz_startjahr', tpop.ekfrequenz_startjahr],
          ['ekfrequenz_abweichend', tpop.ekfrequenz_abweichend],
          ['ekf_kontrolleur', adressName(tpop.ekf_kontrolleur)],
          ['bemerkungen', tpop.bemerkungen],
        ]),
      })
      for (const massn of tpop.massnahmen) {
        // same convention as checks: year-only rows get January 1st
        const date =
          massn.datum ?? (massn.jahr !== null ? `${massn.jahr}-01-01` : null)
        actions.push({
          id: actionId(massn.id),
          place: place2Id(tpop.id),
          date,
          data: buildData([
            ['typ', werteText('massnTyp', massn.typ)],
            ['beschreibung', massn.beschreibung],
            ['bearbeiter', adressName(massn.bearbeiter)],
            ['flaeche', massn.flaeche],
            ['plan_vorhanden', massn.plan_vorhanden],
            ['plan_bezeichnung', massn.plan_bezeichnung],
            ['markierung', massn.markierung],
            ['anz_pflanzen', massn.anz_pflanzen],
            ['anz_triebe', massn.anz_triebe],
            ['anz_pflanzstellen', massn.anz_pflanzstellen],
            ['zieleinheit_anzahl', massn.zieleinheit_anzahl],
            ['zieleinheit_einheit', werteText('einheit', massn.zieleinheit_einheit)],
            ['von_anzahl_individuen', massn.von_anzahl_individuen],
            ['herkunft_pop', massn.herkunft_pop],
            ['wirtspflanze', massn.wirtspflanze],
            ['sammeldatum', massn.sammeldatum],
            ['form', massn.form],
            ['pflanzanordnung', massn.pflanzanordnung],
            ['bemerkungen', massn.bemerkungen],
          ]),
        })
      }
      for (const kontr of tpop.kontrollen) {
        // apf2 has rows with only jahr; keep them with a deterministic date
        const date = kontr.datum ?? `${kontr.jahr}-01-01`
        checks.push({
          id: checkId(kontr.id),
          place: place2Id(tpop.id),
          date,
          data: buildData([
            ['typ', kontr.typ],
            ['bearbeiter', adressName(kontr.bearbeiter)],
            ['vitalitaet', kontr.vitalitaet],
            ['ueberlebensrate', kontr.ueberlebensrate],
            ['entwicklung', werteText('entwicklung', kontr.entwicklung)],
            ['ursachen', kontr.ursachen],
            ['erfolgsbeurteilung', kontr.erfolgsbeurteilung],
            ['umsetzung_aendern', kontr.umsetzung_aendern],
            ['kontrolle_aendern', kontr.kontrolle_aendern],
            ['plan_vorhanden', kontr.plan_vorhanden],
            ['flaeche', kontr.flaeche],
            ['flaeche_ueberprueft', kontr.flaeche_ueberprueft],
            ['lr_delarze', kontr.lr_delarze],
            ['lr_umgebung_delarze', kontr.lr_umgebung_delarze],
            ['vegetationstyp', kontr.vegetationstyp],
            ['konkurrenz', kontr.konkurrenz],
            ['moosschicht', kontr.moosschicht],
            ['krautschicht', kontr.krautschicht],
            ['strauchschicht', kontr.strauchschicht],
            ['baumschicht', kontr.baumschicht],
            ['idealbiotop_uebereinstimmung', werteText('idbiotuebereinst', kontr.idealbiotop_uebereinstimmung)],
            ['handlungsbedarf', kontr.handlungsbedarf],
            ['deckung_vegetation', kontr.deckung_vegetation],
            ['deckung_nackter_boden', kontr.deckung_nackter_boden],
            ['deckung_ap_art', kontr.deckung_ap_art],
            ['jungpflanzen_vorhanden', kontr.jungpflanzen_vorhanden],
            ['vegetationshoehe_maximum', kontr.vegetationshoehe_maximum],
            ['vegetationshoehe_mittel', kontr.vegetationshoehe_mittel],
            ['gefaehrdung', kontr.gefaehrdung],
            ['apber_nicht_relevant', kontr.apber_nicht_relevant],
            ['apber_nicht_relevant_grund', kontr.apber_nicht_relevant_grund],
          ]),
        })
        for (const z of kontr.zaehl) {
          if (z.anzahl === null) continue
          const rows = checkTaxaByArt.get(artIndex) ?? []
          rows.push({
            id: checkTaxonId(z.id),
            check: checkId(kontr.id),
            unit: z.einheit === null ? null : unitId(z.einheit),
            quantity: z.anzahl,
          })
          checkTaxaByArt.set(artIndex, rows)
        }
      }
    }
  }
})

// ---- SQL assembly ---------------------------------------------------------
emit('-- GENERATED FILE - DO NOT EDIT')
emit('-- Source: seed-data/apflora/apf2-example.json (extracted from the apf2 dump)')
emit('-- Regenerate with: npm run apflora:extract && npm run apflora:generate')
emit(`-- Extracted: ${data.meta.extractedAt}`)
emit('--')
emit(`-- Example data from apflora.ch for ${data.arts.length} species:`)
for (const art of data.arts) {
  const popCount = art.pops.length
  const tpopCount = art.pops.reduce((s, p) => s + p.tpops.length, 0)
  const kontrCount = art.pops.reduce(
    (s, p) => s + p.tpops.reduce((ss, t) => ss + t.kontrollen.length, 0),
    0,
  )
  const massnCount = art.pops.reduce(
    (s, p) => s + p.tpops.reduce((ss, t) => ss + t.massnahmen.length, 0),
    0,
  )
  emit(`--   ${art.taxonomie.artname}: ${popCount} Populationen, ${tpopCount} Teil-Populationen, ${kontrCount} Kontrollen, ${massnCount} Massnahmen`)
}
emit('BEGIN;')

emit('-- project (owner role for the demo account is set by insert trigger)')
emit(
  `INSERT INTO projects(project_id, account_id, name, label, subproject_name_singular, subproject_name_plural, places_label_by) values`,
)
emit(
  `  (${q(PROJECT_ID)}, ${q(ACCOUNT_ID)}, 'apflora', 'apflora', 'Art', 'Arten', 'name')`,
)
emit(`  ON CONFLICT (project_id) DO NOTHING;`)

emit('-- place levels')
emit(
  `INSERT INTO place_levels(place_level_id, project_id, level, name_singular_de, name_plural_de, checks, check_quantities, check_taxa, check_reports, check_report_quantities, actions, action_quantities, action_taxa, action_reports, action_report_quantities) values`,
)
emit(
  `  (${q(PLACE_LEVEL_1_ID)}, ${q(PROJECT_ID)}, 1, 'Population', 'Populationen', false, false, false, true, true, false, false, false, true, true),`,
)
emit(
  `  (${q(PLACE_LEVEL_2_ID)}, ${q(PROJECT_ID)}, 2, 'Teil-Population', 'Teil-Populationen', true, true, true, true, true, true, true, true, true, true)`,
)
emit(`  ON CONFLICT (place_level_id) DO NOTHING;`)

emit('-- subprojects (one per species)')
emit(`INSERT INTO subprojects(subproject_id, project_id, name, start_year, data) values`)
data.arts.forEach((art, i) => {
  const d = buildData([
    ['bearbeitung', werteText('apBearbstand', art.ap.bearbeitung)],
    ['umsetzung', werteText('apUmsetzung', art.ap.umsetzung)],
    ['bearbeiter', adressName(art.ap.bearbeiter)],
    ['ekf_beobachtungszeitpunkt', art.ap.ekf_beobachtungszeitpunkt],
  ])
  emit(
    `  (${q(subprojectId(art.ap.id))}, ${q(PROJECT_ID)}, ${q(art.taxonomie.artname)}, ${intOrNull(art.ap.start_jahr)}, ${jsonbOrNull(d)})${i < data.arts.length - 1 ? ',' : ''}`,
  )
})
emit(`  ON CONFLICT (subproject_id) DO NOTHING;`)

emit('-- link subprojects to their taxon in the seeded DB-TAXREF (2017) taxonomy')
for (const art of data.arts) {
  emit(
    `INSERT INTO subproject_taxa(subproject_taxon_id, subproject_id, taxon_id)`,
  )
  emit(
    `  SELECT ${q(derivedId('subproject_taxon', art.taxonomie.id))}, ${q(subprojectId(art.ap.id))}, t.taxon_id`,
  )
  emit(
    `  FROM taxa t JOIN taxonomies USING (taxonomy_id)`,
  )
  emit(
    `  WHERE t.id_in_source = ${q(art.taxonomie.taxid)} AND taxonomies.name = ${q(TAXONOMY_NAME)}`,
  )
  emit(`  ON CONFLICT (subproject_taxon_id) DO NOTHING;`)
}

emit('-- lists for option fields')
emit(`INSERT INTO lists(list_id, project_id, name, value_type) values`)
listDefs.forEach(([key, name], i) => {
  emit(
    `  (${q(listId(key))}, ${q(PROJECT_ID)}, ${q(name)}, 'text')${i < listDefs.length - 1 ? ',' : ''}`,
  )
})
emit(`  ON CONFLICT (list_id) DO NOTHING;`)

const listValuesSql = []
for (const [key, , werteKey, only] of listDefs) {
  let entries = data.werte[werteKey]
    .slice()
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  if (only) entries = entries.filter((w) => only.includes(w.text))
  for (const w of entries) {
    listValuesSql.push(
      `  (${q(listValueId(key, w.text))}, ${q(listId(key))}, ${q(w.text)})`,
    )
  }
}
emit('-- list values (labels double as the value stored in data jsonb)')
emit(`INSERT INTO list_values(list_value_id, list_id, value_text) values`)
emit(listValuesSql.join(',\n'))
emit(`  ON CONFLICT (list_value_id) DO NOTHING;`)

emit('-- units from apf2 zaehl-einheiten actually used')
const einheitText = Object.fromEntries(
  data.werte.einheit.map((w) => [parseInt(w.code, 10), w.text]),
)
emit(`INSERT INTO units(unit_id, project_id, name, summable, sort, type) values`)
const einheitEntries = [...einheitCounts.keys()].sort((a, b) => a - b)
einheitEntries.forEach((code, i) => {
  const name = einheitText[code]
  // "Art ist vorhanden" is a presence statement, not a summable quantity
  const summable = !name?.startsWith('Art ist')
  emit(
    `  (${q(unitId(code))}, ${q(PROJECT_ID)}, ${q(name)}, ${summable}, ${code}, 'numeric')${i < einheitEntries.length - 1 ? ',' : ''}`,
  )
})
emit(`  ON CONFLICT (unit_id) DO NOTHING;`)
emit(`UPDATE projects SET check_taxa_default_unit_id = ${q(unitId(defaultUnitEinheit))}`)
emit(`  WHERE project_id = ${q(PROJECT_ID)};`)

emit('-- fields defining the forms on checks, places and subprojects')
emit(
  `INSERT INTO fields(project_id, field_id, table_name, level, field_type_id, widget_type_id, name, field_label, list_id) values`,
)
fieldDefs.forEach(([table, level, name, label, ftype, widget, listKey], i) => {
  emit(
    `  (${q(PROJECT_ID)}, ${q(fieldId(table, level, name))}, ${q(table)}, ${level === null ? 'null' : level}, ${q(FIELD_TYPE[ftype])}, ${q(WIDGET[widget])}, ${q(name)}, ${q(label)}, ${listKey ? q(listId(listKey)) : 'null'})${i < fieldDefs.length - 1 ? ',' : ''}`,
  )
})
emit(`  ON CONFLICT (field_id) DO NOTHING;`)

// chunked multi-row inserts
const emitChunked = (label, columns, rows, chunkSize = 500) => {
  emit(`-- ${label} (${rows.length} rows)`)
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    emit(`INSERT INTO ${columns.table}(${columns.cols.join(', ')}) values`)
    emit(chunk.map((r) => `  (${r.join(', ')})`).join(',\n'))
    emit(`  ON CONFLICT (${columns.pk}) DO NOTHING;`)
  }
}

emitChunked('places level 1 (apf2: pop)', {
  table: 'places',
  cols: ['place_id', 'subproject_id', 'level', 'name', 'since', 'geometry', 'data'],
  pk: 'place_id',
}, places1.map((p) => [
  q(p.id), q(p.subproject), '1', qOrNull(p.name), intOrNull(p.since),
  geomOrNull(p.geometry), jsonbOrNull(p.data),
]))

emitChunked('places level 2 (apf2: tpop)', {
  table: 'places',
  cols: ['place_id', 'parent_id', 'subproject_id', 'level', 'name', 'since', 'geometry', 'data'],
  pk: 'place_id',
}, places2.map((p) => [
  q(p.id), q(p.parent), q(p.subproject), '2', qOrNull(p.name), intOrNull(p.since),
  geomOrNull(p.geometry), jsonbOrNull(p.data),
]))

emitChunked('checks (apf2: tpopkontr, without Freiwilligen-Kontrollen)', {
  table: 'checks',
  cols: ['check_id', 'place_id', 'date', 'data'],
  pk: 'check_id',
}, checks.map((c) => [q(c.id), q(c.place), q(c.date), jsonbOrNull(c.data)]))

emitChunked('actions (apf2: tpopmassn)', {
  table: 'actions',
  cols: ['action_id', 'place_id', 'date', 'data'],
  pk: 'action_id',
}, actions.map((a) => [q(a.id), q(a.place), qOrNull(a.date), jsonbOrNull(a.data)]))

// check_taxa need the taxon id, resolved per art through the seeded taxonomy
const checkTaxaCount = [...checkTaxaByArt.values()].reduce((s, r) => s + r.length, 0)
emit(`-- check taxa (apf2: tpopkontrzaehl) (${checkTaxaCount} rows)`)
for (const [artIndex, rows] of checkTaxaByArt) {
  const art = data.arts[artIndex]
  emit(`INSERT INTO check_taxa(check_taxon_id, check_id, taxon_id, unit_id, quantity_numeric)`)
  emit(
    `  SELECT v.check_taxon_id, v.check_id, t.taxon_id, v.unit_id, v.quantity_numeric`,
  )
  emit(
    `  FROM (VALUES ${rows
      .map((r) => `(${q(r.id)}::uuid, ${q(r.check)}::uuid, ${r.unit ? q(r.unit) : 'null'}::uuid, ${numOrNull(r.quantity)}::double precision)`)
      .join(', ')}) AS v(check_taxon_id, check_id, unit_id, quantity_numeric)`,
  )
  emit(
    `  CROSS JOIN (SELECT t2.taxon_id FROM taxa t2 JOIN taxonomies USING (taxonomy_id) WHERE t2.id_in_source = ${q(art.taxonomie.taxid)} AND taxonomies.name = ${q(TAXONOMY_NAME)} LIMIT 1) t`,
  )
  emit(`  ON CONFLICT (check_taxon_id) DO NOTHING;`)
}

emit('-- fail loudly if the seeded data is incomplete')
emit(`DO $$`)
emit(`DECLARE`)
emit(`  expected constant integer := ${places1.length + places2.length};`)
emit(`  got integer;`)
emit(`BEGIN`)
emit(
  `  SELECT count(*) INTO got FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = ${q(PROJECT_ID)});`,
)
emit(`  IF got <> expected THEN`)
emit(`    RAISE EXCEPTION 'apflora seed: expected % places, got %', expected, got;`)
emit(`  END IF;`)
emit(`  SELECT count(*) INTO got FROM checks c JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = ${q(PROJECT_ID)});`)
emit(`  IF got <> ${checks.length} THEN`)
emit(`    RAISE EXCEPTION 'apflora seed: expected % checks, got %', ${checks.length}, got;`)
emit(`  END IF;`)
emit(`  SELECT count(*) INTO got FROM actions a JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = ${q(PROJECT_ID)});`)
emit(`  IF got <> ${actions.length} THEN`)
emit(`    RAISE EXCEPTION 'apflora seed: expected % actions, got %', ${actions.length}, got;`)
emit(`  END IF;`)
emit(`  SELECT count(*) INTO got FROM check_taxa ct JOIN checks c USING (check_id) JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = ${q(PROJECT_ID)});`)
emit(`  IF got <> ${checkTaxaCount} THEN`)
emit(`    RAISE EXCEPTION 'apflora seed: expected % check_taxa, got %', ${checkTaxaCount}, got;`)
emit(`  END IF;`)
emit(`  SELECT count(*) INTO got FROM subproject_taxa st JOIN subprojects s USING (subproject_id) WHERE s.project_id = ${q(PROJECT_ID)};`)
emit(`  IF got <> ${data.arts.length} THEN`)
emit(`    RAISE EXCEPTION 'apflora seed: expected % subproject_taxa (DB-TAXREF taxa missing?), got %', ${data.arts.length}, got;`)
emit(`  END IF;`)
emit(`END $$;`)

emit('COMMIT;')
emit('')

writeFileSync(sqlPath, out.join('\n'))
console.log(`Written: ${sqlPath}`)
console.log(
  `Rows: ${places1.length} places L1, ${places2.length} places L2, ${checks.length} checks, ${actions.length} actions, ${checkTaxaCount} check_taxa, ${fieldDefs.length} fields`,
)
