# Scorri per eliminare nelle liste

*Ultimo aggiornamento: 17 aprile 2026*

---

## Panoramica

Le righe delle liste supportano ora un gesto di scorrimento per eliminare, che offre un'eliminazione intuitiva con feedback visivo e conferma.

## Funzionalità implementate

### 1. Scorrere a destra per mostrare l'icona di eliminazione

- Gli utenti possono scorrere qualsiasi riga verso destra se ha la proprietà `onDelete`
- Un'icona del cestino (🗑️) appare dietro la riga durante lo scorrimento
- L'icona è inizialmente bianca/grigia per un feedback visivo discreto

### 2. Feedback visivo alla soglia del 30%

- Quando lo scorrimento supera il 30% della larghezza della riga, l'icona di eliminazione cambia da bianco a rosso
- Questo fornisce un chiaro feedback visivo che la soglia di eliminazione è stata raggiunta
- Il cambio di colore segnala all'utente che rilasciare attiverà il passaggio successivo

### 3. Pulsanti Conferma/Annulla

- Quando lo scorrimento viene rilasciato oltre la soglia del 30%, compaiono due pulsanti di azione:
  - **Pulsante Conferma (✓)**: Pulsante circolare rosso per confermare l'eliminazione
  - **Pulsante Annulla (✕)**: Pulsante circolare grigio per annullare l'azione
- I pulsanti sono posizionati nel 30% sinistro della riga
- Fare clic su Conferma attiva il callback `onDelete`
- Fare clic su Annulla riporta la riga al suo stato normale

### 4. Animazioni fluide

- La riga scorre fluidamente durante il gesto
- Se viene rilasciata prima della soglia del 30%, torna animata alla posizione originale
- Tutte le transizioni utilizzano un easing per un'esperienza utente raffinata

## Utilizzo

Per abilitare lo scorrimento per eliminare su una riga, passa una funzione di callback `onDelete`:

```tsx
<Row
  label="Il mio elemento"
  to="/percorso"
  onDelete={() => {
    // Logica di eliminazione qui
    deleteItem(itemId)
  }}
/>
```

Le righe senza la proprietà `onDelete` continueranno a funzionare normalmente, senza il gesto di scorrimento.

## Implementazione tecnica

- Gli eventi touch (`onTouchStart`, `onTouchMove`, `onTouchEnd`) tracciano i gesti di scorrimento
- La gestione dello stato gestisce l'offset di scorrimento e la modalità di conferma
- Le trasformazioni CSS forniscono un feedback visivo fluido
- La funzionalità è completamente incapsulata nel componente Row
