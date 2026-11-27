# Configurazione

_Ultimo aggiornamento: 8 maggio 2026_

---

## Perché?

- [apflora.ch](https://apflora.ch) è [sviluppato dal 2005](https://apflora.ch/Dokumentation/geschichte) e dimostra l'utilità di un tale strumento. Alcuni esperti di protezione della natura coinvolti hanno desiderato poterlo usare anche in altri progetti
- Non esiste una soluzione «universale» per i progetti di protezione della natura: la maggior parte dei progetti non potrebbe/dovrebbe usare apflora.ch senza modifiche
- Pochissime istituzioni pubbliche o studi ecologici possono o vogliono permettersi lo sviluppo di un prodotto su misura come https://apflora.ch, https://vermehrung.ch o https://arteigenschaften.ch

## Cosa?

Per questo arten-fördern.app è altamente configurabile:

- Denominazione libera dei sottoprogetti (p.es. come 'specie' o 'biotopi')
- Scelta di unità predefinite (da liste definite autonomamente, vedi sotto)
- Scelta delle funzionalità utilizzate e del loro modo di visualizzazione
- Scelta del numero di livelli per i luoghi (1 o 2)
- Denominazione libera dei livelli dei luoghi
- Scelta delle funzionalità utilizzate per ogni livello di luogo (misure, controlli, rapporti ecc.)
- Possibilità di aggiungere campi personalizzati in molte tabelle
- Definizione e importazione libere di tassonomie
- Definizione e importazione libere di liste
- Selezione di grafici predefiniti, possibilità di creare i propri
- Possibilità di creare rapporti personalizzati a livello di progetto e sottoprogetto, con integrazione dei grafici
- Possibilità di importare osservazioni da qualsiasi fonte
- Integrazione di diverse fonti per livelli mappa (WMS, WFS, importazioni...)
  - Per geometrie suddivise, selezionare insieme i file, spuntare i livelli desiderati e scegliere il campo UUID di ogni livello (non necessario per un singolo oggetto). L’aggiunta o la sostituzione avviene una sola volta per oggetto su tutti i livelli selezionati. In caso di errore non viene modificato nulla.
  - **Esporta geometrie** nella lista di progetti, luoghi, azioni o controlli esporta gli oggetti visualizzati con geometria in WGS84. Scegliere GeoPackage, GeoJSON, CSV (WKT) o KML. Ogni oggetto conserva UUID e attributi. I codici delle liste hanno anche una colonna `_label` se disponibile. I campi personalizzati usano `data_<chiave>`; in caso di conflitto viene aggiunto un suffisso numerico. Per reimportare le geometrie scegliere la colonna UUID originale. Gli altri attributi non vengono modificati.
  - Per condividere un file GIS, scegliere il tipo **Upload** per un livello vettoriale del progetto. Formati: GeoPackage, Shapefile in ZIP (con i file associati), GeoJSON, KML/KMZ, GPX, CSV e File Geodatabase in ZIP. Scegliere il livello e, per CSV, le colonne X e Y. Verificare il codice EPSG di origine quando richiesto; le coordinate vengono convertite in WGS84.
  - Per progetti, luoghi, azioni e controlli, scegliere **Importa geometrie** nel menu geometria dell’oggetto o nell’intestazione della lista. I formati e le opzioni di proiezione sono gli stessi. Per una lista scegliere il campo UUID degli oggetti visualizzati; per un solo oggetto non occorre un ID. Le geometrie vengono aggiunte per impostazione predefinita. La sostituzione riguarda solo gli oggetti corrispondenti. Sono necessari una connessione e i permessi di scrittura; per i progetti servono poligoni e il ruolo di progettista o proprietario. Un errore annulla l’intera importazione. Le geometrie delle osservazioni restano derivate dai dati di origine.
  - L’importazione richiede una connessione e permessi di scrittura nel progetto. L’aggiunta conserva gli oggetti esistenti; la sostituzione li elimina solo se l’importazione riesce. Dopo la sincronizzazione il livello si può attivare, stilizzare e interrogare anche offline. Limiti: 64 MiB per file, 256 MiB per archivio decompresso.
- Scelta libera del sistema di riferimento di coordinate, possibilità di definire il proprio
  - Il globo accanto a «Mostra il centro della mappa» permette di scegliere tra WGS84 e i sistemi configurati nel progetto. In modalità progettazione la scelta modifica il valore predefinito del progetto; altrimenti vale solo per il tuo account su questo dispositivo.
- Selezione di controlli qualità predefiniti, possibilità di creare i propri
- Selezione di esportazioni predefinite, possibilità di creare le proprie
- Disponibile in 4 lingue: tedesco, francese, italiano, inglese

## Come?

Devi riflettere fin dall'inizio su come organizzare al meglio il tuo progetto e su come utilizzare arten-fördern.app per farlo.

Per questo hai tre opzioni:

### 1 «Mi lancio e mi preoccupo della configurazione quando sarà necessario»

Mi fa piacere se sottoscrivi un abbonamento per farlo. Ma è probabile che le cose avrebbero potuto andare molto meglio per voi. Le modifiche di configurazione a posteriori possono essere molto dispendiose in termini di tempo e riguardare tutte le persone coinvolte.

Se un progetto ha successo, si sviluppa nel corso degli anni. Adattamenti ed estensioni successivi sono quindi raramente evitabili anche con una buona preparazione. Ma possono essere minimizzati.

### 2 «Mi dedico del tempo all'inizio e configuro da solo»

Buona idea. Dimmi per favore cosa dovrei documentare meglio, e cosa manca o dovrebbe funzionare diversamente per il tuo progetto.

### 3 «Mi dedico del tempo all'inizio e mi faccio supportare»

Oggi sviluppo software, ma [capisco anche qualcosa di protezione della natura](https://gabriel-software.ch/kontakt). Se ragiono insieme a te, puoi probabilmente ridurre il tuo impegno — e la probabilità o l'entità di modifiche successive.

Il tuo progetto e la sua configurazione ottimale in arten-fördern.app mi interessano. Sarei quindi felice di aiutare a pianificare fin dall'inizio gratuitamente o a tariffe modeste, e di contabilizzare lo sforzo come formazione continua, networking e marketing.
