# Mit Wischen löschen in Listen

Zuletzt aktualisiert am 17. April 2026

## Übersicht

Listenzeilen unterstützen jetzt eine Wischgeste zum Löschen, die eine intuitive Bedienung mit visuellem Feedback und Bestätigung ermöglicht.

## Implementierte Funktionen

### 1. Nach rechts wischen zum Anzeigen des Löschsymbols

- Benutzer können jede Zeile nach rechts wischen, wenn diese die `onDelete`-Eigenschaft hat
- Hinter der Zeile erscheint ein Papierkorb-Symbol (🗑️), während die Zeile gewischt wird
- Das Symbol ist zunächst weiß/grau für ein dezentes visuelles Feedback

### 2. Visuelles Feedback ab 30 % Schwellenwert

- Wenn die Wischbewegung 30 % der Zeilenbreite überschreitet, wechselt das Löschsymbol von weiß zu rot
- Dies gibt eine klare visuelle Rückmeldung, dass der Löschschwellenwert erreicht wurde
- Der Farbwechsel signalisiert, dass ein Loslassen den nächsten Schritt auslöst

### 3. Bestätigen-/Abbrechen-Schaltflächen

- Wenn die Wischbewegung jenseits des 30-%-Schwellenwerts losgelassen wird, erscheinen zwei Aktionsschaltflächen:
  - **Bestätigen-Schaltfläche (✓)**: Rote runde Schaltfläche zur Bestätigung der Löschung
  - **Abbrechen-Schaltfläche (✕)**: Graue runde Schaltfläche zum Abbrechen der Aktion
- Die Schaltflächen befinden sich in der linken 30 % der Zeile
- Ein Klick auf „Bestätigen" löst den `onDelete`-Callback aus
- Ein Klick auf „Abbrechen" setzt die Zeile in ihren ursprünglichen Zustand zurück

### 4. Sanfte Animationen

- Die Zeile gleitet während der Wischgeste flüssig
- Wird sie vor dem 30-%-Schwellenwert losgelassen, animiert sie zurück in ihre Ausgangsposition
- Alle Übergänge verwenden Easing für ein poliertes Benutzererlebnis

## Verwendung

Um „Mit Wischen löschen" für eine Zeile zu aktivieren, übergebe eine `onDelete`-Callback-Funktion:

```tsx
<Row
  label="Mein Eintrag"
  to="/pfad"
  onDelete={() => {
    // Löschlogik hier
    deleteItem(itemId)
  }}
/>
```

Zeilen ohne die `onDelete`-Eigenschaft funktionieren weiterhin normal, ohne die Wischgeste.

## Technische Umsetzung

- Touch-Events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) verfolgen Wischgesten
- Die Zustandsverwaltung behandelt den Wisch-Offset und den Bestätigungsmodus
- CSS-Transforms sorgen für flüssiges visuelles Feedback
- Die Funktion ist vollständig in der Row-Komponente gekapselt
