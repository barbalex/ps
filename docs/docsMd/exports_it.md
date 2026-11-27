# Esportazioni

*Ultimo aggiornamento: 27 novembre 2026*

---

Le esportazioni consentono di:

1. Esportare parti dei dati
2. Generare query personalizzate

Formati:

- .csv (semplice, universalmente utilizzabile)
- .ods (per documenti foglio di calcolo)
- .xlsx (per documenti foglio di calcolo)

Gli utenti con il ruolo "Proprietario" o "Designer" possono scegliere quali delle esportazioni predefinite sono disponibili — e possono crearne di proprie.

Le esportazioni sono disponibili a livello di progetto e sotto-progetto (specie/biotopo).

Vuoi filtrare l'esportazione? Puoi impostare qualsiasi filtro sulla tabella di base nel modulo di filtro e applicarlo durante l'esecuzione dell'esportazione.

## Aprire un progetto in QGIS

Per creare una mappa, apri il progetto e scegli **Esporta progetto → GeoPackage (.gpkg)** nell’intestazione. Trascina il file scaricato in QGIS e seleziona i layer desiderati. Un GeoPackage è un database SQLite che indica a QGIS le colonne geometriche e il loro sistema di coordinate. Non serve un’esportazione SpatiaLite separata.

Se tutti i luoghi sono punti, seleziona `places`. Se la tabella contiene tipi di geometria diversi, scegli i layer corrispondenti, ad esempio `places_points` o `places_lines`. Usa `place_id` per collegarli agli attributi di `places`. I luoghi senza geometria rimangono nella tabella ma non compaiono sulla mappa.

### Hai già un’esportazione SQLite?

**SQLite (.sqlite)** è utile per query e join. Le geometrie sono salvate come testo GeoJSON, quindi QGIS apre `places` come tabella. Per visualizzare i punti senza modificare il file:

1. Trascina il file `.sqlite` in QGIS, aggiungi la tabella `places` e rinomina il layer `places_raw`.
2. Nel menu **Layer → Aggiungi layer**, apri la finestra dei layer virtuali.
3. Incolla questa query e fai clic su **Aggiungi**:

```sql
SELECT p.place_id, p.name,
       SetSRID(CastToMultiPoint(CollectionExtract(GeomFromGeoJSON(p.geometry), 1)), 4326) AS geom
FROM places_raw AS p
WHERE p.geometry IS NOT NULL
```

Il layer virtuale mostra tutti i punti in WGS 84 (EPSG:4326), ma non le linee o i poligoni.
