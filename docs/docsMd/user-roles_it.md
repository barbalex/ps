# Ruoli utente

## Proprietà

Un utente è proprietario della propria riga utente, degli account associati, dei progetti e di tutti i dati creati in questi progetti.

## Ruoli

I tipi di ruolo sono (dal più alto al più basso):

1. Proprietario: può assegnare ruoli Manager
2. Manager: può modificare la configurazione di progetti e sottoprogetti, può assegnare ruoli Redattore e Lettore
3. Redattore: può modificare i dati
4. Lettore: può sincronizzare e leggere i dati

Un tipo di ruolo include sempre tutti i tipi di ruolo inferiori. Non vengono impostati separatamente — è sufficiente impostare un solo ruolo per livello.
Un ruolo è la combinazione di utente e tipo di ruolo.

## Dove vengono assegnati i ruoli

I ruoli vengono assegnati a quattro livelli:

1. progetti
2. sottoprogetti (specie o biotopi)
3. luoghi (livelli 1 e 2, ad esempio: popolazioni e sottopopolazioni)

## Come funzionano i ruoli

Quando viene impostato un ruolo, il suo effetto si estende a tutti i livelli inferiori. L'app imposta automaticamente tutti i ruoli dei livelli inferiori.

Esempio: quando all'utente test@test.ch viene assegnato il ruolo Redattore sul progetto, l'app assegna automaticamente a questo utente ruoli Redattore in tutti i sottoprogetti e luoghi.

L'impostazione di diritti inferiori a un livello inferiore non è supportata. Esempio: quando un utente ha il ruolo Lettore su un progetto, tutti i suoi dati possono essere sincronizzati senza controllare i livelli inferiori.

Diritti superiori possono essere assegnati a livelli inferiori, con effetto che si estende anch'esso verso il basso. Esempio: un Lettore che deve essere Redattore su un sottoprogetto necessita del ruolo Lettore sul progetto padre per sincronizzare i dati padre, senza i quali non potrebbe lavorare.

## Come impostare i ruoli

I ruoli Proprietario vengono impostati automaticamente dall'app e non possono essere modificati.

È importante sapere che quando si impostano i ruoli, l'app copia automaticamente quel ruolo a tutti i livelli inferiori. Impostare ruoli inferiori a livelli superiori dopo aver impostato ruoli superiori a livelli inferiori comporterà la sovrascrittura dei ruoli ai livelli inferiori. Pertanto, **i ruoli devono essere impostati dall'alto verso il basso (progetti → sottoprogetti → luoghi livello 1 → luoghi livello 2)**.

D'altra parte, è necessario impostare i ruoli sui livelli inferiori (potenzialmente numerosi) solo se si desidera esplicitamente differenziare. In caso contrario, si possono semplicemente ignorare.

Quando si creano nuovi sottoprogetti e luoghi, l'app copia automaticamente i ruoli dal livello immediatamente superiore. Pertanto è necessario impostarli solo se devono esplicitamente differire.
