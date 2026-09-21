#!/usr/bin/env node
// Extracts example data for three species from a local apf2 database dump
// into seed-data/apflora/apf2-example.json, for generate_apflora_example_sql.mjs.
// Run from the project root: node backend/db/extract_apflora_example.mjs
//
// Source dump: custom-format pg_dump of the apf2 backend-dev database.
// Default path assumes apf2 is checked out next to this repo;
// override with APF2_DUMP=/path/to/apflora.backup.
// Excluded by design: Freiwilligen-Kontrollen, Beobachtungen, Massnahmen.

import { spawnSync } from 'child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const dumpPath =
  process.env.APF2_DUMP ??
  join(projectRoot, '..', 'apf2', 'backend-dev', 'db', 'apflora.backup')
const outPath = join(projectRoot, 'seed-data', 'apflora', 'apf2-example.json')

// resolved by artname, not by (unstable) uuid
const ARTNAMES = [
  'Abies alba Mill.',
  'Aldrovanda vesiculosa L.',
  'Pulsatilla vulgaris Mill.',
]
// tpopkontr.typ stores the werte text; Freiwilligen-Kontrollen are excluded
const KONTROLL_TYPEN = ['Ausgangszustand', 'Kontrolle']

if (!existsSync(dumpPath)) {
  console.error(`Dump not found: ${dumpPath}`)
  console.error('Set APF2_DUMP to the apflora.backup path (pg_dump -Fc format).')
  process.exit(1)
}

const tmpDir = mkdtempSync(join(tmpdir(), 'ps-apf2-extract-'))

const restoreTable = (table) => {
  const tmpFile = join(tmpDir, `${table}.sql`)
  const { stderr, status } = spawnSync(
    'pg_restore',
    ['--data-only', `--table=${table}`, '-f', tmpFile, dumpPath],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (status !== 0) {
    console.error(`pg_restore failed for ${table}:\n${stderr}`)
    process.exit(1)
  }
  return readFileSync(tmpFile, 'utf8')
}

// Parses one COPY text-format line: tab-separated fields,
// \N as a whole field = NULL, \\ \n \r \t backslash escapes within fields.
const parseCopyLine = (line) => {
  const fields = []
  let field = ''
  let nullField = false
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === '\\') {
      const next = line[i + 1]
      if (next === '\\') field += '\\'
      else if (next === 'n') field += '\n'
      else if (next === 'r') field += '\r'
      else if (next === 't') field += '\t'
      else if (next === 'N') {
        if (field === '') nullField = true
        else field += 'N'
      } else field += next ?? ''
      i += 2
    } else if (ch === '\t') {
      fields.push(nullField ? null : field)
      field = ''
      nullField = false
      i += 1
    } else {
      field += ch
      nullField = false
      i += 1
    }
  }
  fields.push(nullField ? null : field)
  return fields
}

const parseCopy = (text) => {
  const lines = text.split('\n')
  let columns = null
  const rows = []
  for (const line of lines) {
    if (!columns) {
      const match = line.match(/^COPY [^(]+\(([^)]*)\) FROM stdin;$/)
      if (match) columns = match[1].split(',').map((c) => c.trim())
      continue
    }
    if (line === '\\.') break
    const fields = parseCopyLine(line)
    if (fields.length !== columns.length) {
      throw new Error(
        `Row has ${fields.length} fields, expected ${columns.length}: ${JSON.stringify(fields.slice(0, 5))}`,
      )
    }
    const obj = {}
    columns.forEach((c, idx) => {
      obj[c] = fields[idx]
    })
    rows.push(obj)
  }
  return rows
}

const readTable = (table) => {
  const rows = parseCopy(restoreTable(table))
  console.log(`${table}: ${rows.length} rows`)
  return rows
}

// hex EWKB point (optionally with SRID) -> GeoJSON Point
const ewkbToPoint = (hex) => {
  if (!hex) return null
  const buf = Buffer.from(hex, 'hex')
  if (buf[0] !== 1) throw new Error(`Only little-endian EWKB supported: ${hex}`)
  const type = buf.readUInt32LE(1)
  const geomType = type & 0x0fffffff
  if (geomType !== 1) throw new Error(`Only Point geometry supported, got type ${geomType}`)
  let offset = 5
  if (type & 0x20000000) offset += 4 // skip SRID (always 4326 in apf2)
  return {
    type: 'Point',
    coordinates: [buf.readDoubleLE(offset), buf.readDoubleLE(offset + 8)],
  }
}

const asInt = (v) => (v === null || v === undefined || v === '' ? null : parseInt(v, 10))
const asFloat = (v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))
const asBool = (v) => {
  if (v === null || v === undefined || v === '') return null
  if (v === 't' || v === 'true') return true
  if (v === 'f' || v === 'false') return false
  throw new Error(`Not a boolean: ${v}`)
}

const data = {
  meta: {
    extractedAt: new Date().toISOString(),
    source: 'apf2 backend-dev dump (apflora.backup)',
    artnameFilter: ARTNAMES,
    kontrollTypen: KONTROLL_TYPEN,
  },
  werte: {},
  adressen: [],
  arts: [],
}

// value lists (code -> text), for building ps lists and readable data
const werteTables = {
  typ: 'tpopkontr_typ_werte',
  entwicklung: 'tpop_entwicklung_werte',
  idbiotuebereinst: 'tpopkontr_idbiotuebereinst_werte',
  einheit: 'tpopkontrzaehl_einheit_werte',
  methode: 'tpopkontrzaehl_methode_werte',
  popStatus: 'pop_status_werte',
  apberRelevantGrund: 'tpop_apberrelevant_grund_werte',
  apBearbstand: 'ap_bearbstand_werte',
  apUmsetzung: 'ap_umsetzung_werte',
}
for (const [key, table] of Object.entries(werteTables)) {
  data.werte[key] = readTable(table)
    .map((r) => ({ code: r.code, text: r.text, sort: r.sort }))
    .filter((r) => r.code !== undefined)
}

const adressenAll = readTable('adresse')
const adressenById = new Map(adressenAll.map((r) => [r.id, r]))

const taxAll = readTable('ae_taxonomies')
const apAll = readTable('ap')
const popAll = readTable('pop')
const tpopAll = readTable('tpop')
const kontrAll = readTable('tpopkontr')
const zaehlAll = readTable('tpopkontrzaehl')

const neededAdresseIds = new Set()

const zaehlByKontr = new Map()
for (const z of zaehlAll) {
  const list = zaehlByKontr.get(z.tpopkontr_id) ?? []
  list.push({
    id: z.id,
    anzahl: asFloat(z.anzahl),
    einheit: asInt(z.einheit),
    methode: asInt(z.methode),
  })
  zaehlByKontr.set(z.tpopkontr_id, list)
}

const kontrByTpop = new Map()
let skippedFreiwillig = 0
for (const k of kontrAll) {
  if (k.typ === 'Freiwilligen-Kontrolle') {
    skippedFreiwillig++
    continue
  }
  if (!KONTROLL_TYPEN.includes(k.typ)) continue
  if (k.bearbeiter) neededAdresseIds.add(k.bearbeiter)
  const list = kontrByTpop.get(k.tpop_id) ?? []
  list.push({
    id: k.id,
    typ: k.typ,
    datum: k.datum,
    jahr: asInt(k.jahr),
    bearbeiter: k.bearbeiter,
    vitalitaet: k.vitalitaet,
    ueberlebensrate: asInt(k.ueberlebensrate),
    entwicklung: asInt(k.entwicklung),
    ursachen: k.ursachen,
    erfolgsbeurteilung: k.erfolgsbeurteilung,
    umsetzung_aendern: k.umsetzung_aendern,
    kontrolle_aendern: k.kontrolle_aendern,
    bemerkungen: k.bemerkungen,
    lr_delarze: k.lr_delarze,
    flaeche: asInt(k.flaeche),
    lr_umgebung_delarze: k.lr_umgebung_delarze,
    vegetationstyp: k.vegetationstyp,
    konkurrenz: k.konkurrenz,
    moosschicht: k.moosschicht,
    krautschicht: k.krautschicht,
    strauchschicht: k.strauchschicht,
    baumschicht: k.baumschicht,
    idealbiotop_uebereinstimmung: asInt(k.idealbiotop_uebereinstimmung),
    handlungsbedarf: k.handlungsbedarf,
    flaeche_ueberprueft: asInt(k.flaeche_ueberprueft),
    plan_vorhanden: asBool(k.plan_vorhanden),
    deckung_vegetation: asInt(k.deckung_vegetation),
    deckung_nackter_boden: asInt(k.deckung_nackter_boden),
    deckung_ap_art: asInt(k.deckung_ap_art),
    jungpflanzen_vorhanden: asBool(k.jungpflanzen_vorhanden),
    vegetationshoehe_maximum: asInt(k.vegetationshoehe_maximum),
    vegetationshoehe_mittel: asInt(k.vegetationshoehe_mittel),
    gefaehrdung: k.gefaehrdung,
    apber_nicht_relevant: asBool(k.apber_nicht_relevant),
    apber_nicht_relevant_grund: k.apber_nicht_relevant_grund,
    zaehl: zaehlByKontr.get(k.id) ?? [],
  })
  kontrByTpop.set(k.tpop_id, list)
}

const tpopByPop = new Map()
for (const t of tpopAll) {
  if (t.ekf_kontrolleur) neededAdresseIds.add(t.ekf_kontrolleur)
  const list = tpopByPop.get(t.pop_id) ?? []
  list.push({
    id: t.id,
    nr: asInt(t.nr),
    gemeinde: t.gemeinde,
    flurname: t.flurname,
    geom_point: ewkbToPoint(t.geom_point),
    radius: asInt(t.radius),
    hoehe: asInt(t.hoehe),
    exposition: t.exposition,
    klima: t.klima,
    neigung: t.neigung,
    boden_typ: t.boden_typ,
    boden_kalkgehalt: t.boden_kalkgehalt,
    boden_durchlaessigkeit: t.boden_durchlaessigkeit,
    boden_humus: t.boden_humus,
    boden_naehrstoffgehalt: t.boden_naehrstoffgehalt,
    boden_abtrag: t.boden_abtrag,
    wasserhaushalt: t.wasserhaushalt,
    beschreibung: t.beschreibung,
    kataster_nr: t.kataster_nr,
    status: asInt(t.status),
    status_unklar: asBool(t.status_unklar),
    status_unklar_grund: t.status_unklar_grund,
    apber_relevant: asBool(t.apber_relevant),
    apber_relevant_grund: asInt(t.apber_relevant_grund),
    bekannt_seit: asInt(t.bekannt_seit),
    eigentuemer: t.eigentuemer,
    kontakt: t.kontakt,
    nutzungszone: t.nutzungszone,
    bewirtschafter: t.bewirtschafter,
    bewirtschaftung: t.bewirtschaftung,
    ekfrequenz_startjahr: asInt(t.ekfrequenz_startjahr),
    ekfrequenz_abweichend: asBool(t.ekfrequenz_abweichend),
    ekf_kontrolleur: t.ekf_kontrolleur,
    bemerkungen: t.bemerkungen,
    kontrollen: kontrByTpop.get(t.id) ?? [],
  })
  tpopByPop.set(t.pop_id, list)
}

const popByAp = new Map()
for (const p of popAll) {
  const list = popByAp.get(p.ap_id) ?? []
  list.push({
    id: p.id,
    nr: asInt(p.nr),
    name: p.name,
    status: asInt(p.status),
    status_unklar: asBool(p.status_unklar),
    status_unklar_begruendung: p.status_unklar_begruendung,
    bekannt_seit: asInt(p.bekannt_seit),
    geom_point: ewkbToPoint(p.geom_point),
    tpops: tpopByPop.get(p.id) ?? [],
  })
  popByAp.set(p.ap_id, list)
}

const apByArt = new Map(apAll.map((a) => [a.art_id, a]))

for (const artname of ARTNAMES) {
  const tax = taxAll.find((t) => t.artname === artname)
  if (!tax) throw new Error(`Species not found in ae_taxonomies: ${artname}`)
  const ap = apByArt.get(tax.id)
  if (!ap) throw new Error(`No ap row for ${artname} (${tax.id})`)
  if (ap.bearbeiter) neededAdresseIds.add(ap.bearbeiter)
  const pops = popByAp.get(ap.id) ?? []
  const tpopCount = pops.reduce((sum, p) => sum + p.tpops.length, 0)
  const kontrCount = pops.reduce(
    (sum, p) => sum + p.tpops.reduce((s, t) => s + t.kontrollen.length, 0),
    0,
  )
  console.log(`${artname}: ${pops.length} pops, ${tpopCount} tpops, ${kontrCount} kontrollen`)
  data.arts.push({
    taxonomie: {
      id: tax.id,
      taxid: tax.taxid,
      artname: tax.artname,
      familie: tax.familie,
      taxonomie_name: tax.taxonomie_name,
    },
    ap: {
      id: ap.id,
      bearbeitung: asInt(ap.bearbeitung),
      start_jahr: asInt(ap.start_jahr),
      umsetzung: asInt(ap.umsetzung),
      bearbeiter: ap.bearbeiter,
      ekf_beobachtungszeitpunkt: ap.ekf_beobachtungszeitpunkt,
    },
    pops,
  })
}

data.adressen = [...neededAdresseIds]
  .filter((id) => adressenById.has(id))
  .map((id) => ({ id, name: adressenById.get(id).name }))

console.log(`Freiwilligen-Kontrollen skipped (all species): ${skippedFreiwillig}`)

writeFileSync(outPath, JSON.stringify(data, null, 1))
console.log(`Written: ${outPath}`)
