# Benutzerrollen

Zuletzt aktualisiert am 17. April 2026

## Eigentümerschaft

Ein Benutzer ist Eigentümer seines eigenen Benutzer-Datensatzes, der zugehörigen Konten, Projekte und aller in diesen Projekten erstellten Daten.

## Rollen

Rollentypen sind (von hoch nach tief):

1. Eigentümer: kann Designer-Rollen vergeben
2. Designer: kann Projekt- und Teilprojekt-Konfigurationen bearbeiten, kann Schreiber- und Leser-Rollen vergeben
3. Schreiber: kann Daten bearbeiten
4. Leser: kann Daten synchronisieren und lesen

Ein Rollentyp schliesst immer alle niedrigeren Rollentypen ein. Sie werden nicht separat gesetzt, es muss pro Ebene nur eine einzige Rolle gesetzt werden.
Eine Rolle ist die Kombination aus Benutzer und Rollentyp.

## Wo Rollen vergeben werden

Rollen werden auf vier Ebenen vergeben:

1. Projekte
2. Teilprojekte (Arten oder Biotope)
3. Orte (Ebene 1 und 2, z.B.: Populationen und Teilpopulationen)

## Wie Rollen funktionieren

Wenn eine Rolle gesetzt wird, erstreckt sich ihre Wirkung auf alle tieferen Ebenen. Die App setzt automatisch alle niedrigeren Rollen.

Beispiel: Wenn dem Benutzer test@test.ch die Schreiber-Rolle auf dem Projekt vergeben wird, gibt die App diesem Benutzer automatisch Schreiber-Rollen in allen Teilprojekten und Orten.

Das Setzen niedrigerer Rechte auf tieferer Ebene wird nicht unterstützt. Beispiel: Wenn ein Benutzer die Leser-Rolle auf einem Projekt hat, können alle seine Daten synchronisiert werden, ohne dass tiefere Ebenen geprüft werden.

Höhere Rechte können auf tieferen Ebenen vergeben werden, ihre Wirkung erstreckt sich ebenfalls nach unten. Beispiel: Ein Leser, der auf einem Teilprojekt Schreiber sein soll, benötigt die Leser-Rolle auf dem übergeordneten Projekt, um übergeordnete Daten zu synchronisieren, ohne die er nicht arbeiten könnte.

## Wie Rollen gesetzt werden

Eigentümer-Rollen werden automatisch von der App gesetzt und können nicht geändert werden.

Es ist wichtig zu wissen, dass die App beim Setzen von Rollen diese Rolle automatisch auf alle tieferen Ebenen kopiert. Das Setzen niedrigerer Rollen auf höheren Ebenen, nachdem auf tieferen Ebenen bereits höhere Rollen gesetzt wurden, führt dazu, dass die Rollen auf den tieferen Ebenen überschrieben werden. Daher **sollten Rollen von oben (Projekte) nach unten (Teilprojekte, Orte Ebene 1, Orte Ebene 2) gesetzt werden**.

Andererseits muss man Rollen auf (möglicherweise zahlreichen) tieferen Ebenen nur dann setzen, wenn man dort explizit differenzieren möchte. Wenn nicht, kann man sie einfach ignorieren.

Beim Erstellen neuer Teilprojekte und Orte kopiert die App automatisch die Rollen der nächsthöheren Ebene nach unten. Man muss sie also nur setzen, wenn sie explizit abweichen sollen.
