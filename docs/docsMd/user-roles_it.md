# Ruoli utente

*Ultimo aggiornamento: 5 maggio 2026*

---

## Proprietà

Un utente è proprietario:

- della propria scheda utente,
- degli account associati,
- dei progetti
- e di tutti i dati creati in questi progetti.

I ruoli Proprietario vengono impostati automaticamente dall'app e non possono essere modificati.

## Ruoli

I ruoli sono elencati dal più alto al più basso:

1. **Proprietario**: può assegnare ruoli Designer
2. **Designer**: può modificare tutte le configurazioni di progetti e sottoprogetti, assegnare ruoli Redattore e Lettore
3. **Redattore**: può modificare tutti i dati
4. **Redattore (specifico)**: può modificare i dati per i quali gli è stato assegnato questo ruolo
5. **Lettore**: può sincronizzare e leggere tutti i dati
6. **Lettore (specifico)**: può sincronizzare e leggere i dati per i quali gli è stato assegnato questo ruolo

Un ruolo include sempre tutti i ruoli inferiori. Non vengono impostati separatamente — è sufficiente impostare un solo ruolo per livello.

Esistono ruoli _specifici_. Gli altri si applicano _in generale_. Maggiori dettagli più avanti.

## Dove vengono assegnati i ruoli

I ruoli vengono assegnati a quattro livelli:

1. Progetti
2. Sottoprogetti (specie o biotopi)
3. Luoghi livello 1, ad es. popolazioni
4. Luoghi livello 2, ad es. sottopopolazioni

## Come funzionano i ruoli generali

Quando viene impostato un ruolo generale, il suo effetto si estende a tutti i livelli inferiori. L'app imposta automaticamente tutti i ruoli dei livelli inferiori.

Diritti superiori possono essere assegnati a livelli inferiori, con effetto che si estende anch'esso verso il basso. L'impostazione di diritti inferiori a livelli inferiori è supportata solo per i ruoli specifici.

È importante sapere che quando si impostano ruoli generali, l'app copia automaticamente quel ruolo a tutti i livelli inferiori. Pertanto, **i ruoli generali devono essere assegnati dall'alto verso il basso (progetti → sottoprogetti → luoghi livello 1 → luoghi livello 2)**.

Esempio: se dai a test@test.ch il ruolo Lettore sul progetto, l'app assegna automaticamente a questa persona ruoli Lettore in tutti i sottoprogetti e luoghi. Puoi inoltre concederle diritti di scrittura su sottoprogetti o luoghi specifici.

## Come funzionano i ruoli specifici

I ruoli specifici servono per concedere a un utente diritti solo su una parte dei dati. Quando si sceglie un ruolo specifico, i ruoli al livello immediatamente inferiore devono quindi essere assegnati manualmente (non vengono impostati automaticamente).

Esempio: dai a test@test.ch il ruolo `Lettore (specifico)` su un progetto. Puoi quindi assegnargli diritti differenziati a livello di sottoprogetto: Redattore, Lettore — o nessuno. Se non gli assegni alcun diritto su un sottoprogetto, non vedrà quel sottoprogetto.

## Gli utenti hanno bisogno di diritti fino in cima

Non è sufficiente dare a un utente che deve lavorare su un sottoprogetto i soli diritti di scrittura su quel sottoprogetto. Ha bisogno del ruolo Lettore sul progetto padre per sincronizzare i dati padre, senza i quali non potrebbe lavorare.
