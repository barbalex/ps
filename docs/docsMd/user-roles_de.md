# Benutzerrollen

_Zuletzt aktualisiert am 5.5.2026_

---

## Eigentümerschaft

Ein Benutzer ist Eigentümer:

- seines eigenen Benutzer-Datensatzes,
- der zugehörigen Konten,
- Projekte
- und aller in diesen Projekten erstellten Daten.

Eigentümer-Rollen werden automatisch von der App gesetzt und können nicht geändert werden.

## Rollen

Rollen sind von hoch nach tief:

1. **Eigentümer**: kann Designer-Rollen vergeben
2. **Designer**: kann Projekt- und Teilprojekt-Konfigurationen bearbeiten, Schreiber- und Leser-Rollen vergeben
3. **Schreiber**: kann alle Daten bearbeiten
4. **Schreiber (spezifisch)**: kann nur Daten bearbeiten, wo er die entsprechende Rolle zugewiesen bekommt
5. **Leser**: kann Daten synchronisieren und lesen
6. **Leser (spezifisch)**: kann nur Daten synchronisieren und lesen, wo er die entsprechende Rolle zugewiesen bekommt

Es gibt _spezifische_ Rollen. Die übrigen gelten _generell_. Mehr dazu weiter unten.

Eine Rolle schliesst immer alle niedrigeren Rollen ein. Sie werden nicht separat gesetzt, es muss pro Ebene nur eine einzige Rolle gesetzt werden.

## Wo Rollen vergeben werden

Rollen werden auf vier Ebenen vergeben:

1. Projekte
2. Teilprojekte (Arten oder Biotope)
3. Orte Ebene 1, z.B. Populationen
4. Orte Ebene 2, z.B. Teilpopulationen

## Wie generelle Rollen funktionieren

Wenn eine generelle Rolle gesetzt wird, erstreckt sich ihre Wirkung auf alle tieferen Ebenen. Die App setzt automatisch alle niedrigeren Rollen (und überschreibt dabei schon bestehende!).

Das Setzen niedrigerer Rechte auf tieferer Ebene wird nur bei spezifischen Rollen unterstützt. Höhere Rechte hingegen können auf tieferen Ebenen vergeben werden. Ihre Wirkung erstreckt sich ebenfalls nach unten.

Beispiel: Wenn test@test.ch die Leser-Rolle auf dem Projekt erhält, gibt ihm die App automatisch Leser-Rollen in allen Teilprojekten und Orten. Du kannst ihm zusätzlich auf bestimmten Arten, Populationen oder Teilpopulationen Schreibrechte vergeben.

## Wie spezifische Rollen funktionieren

Spezifische Rollen sind dazu da, dass man einem Benutzer nur für einen Teil der Daten Rechte vergeben kann. Wählt man eine spezifische Rolle, müssen daher in der nächsttieferen Stufe die Rollen manuell vergeben werden (sie werden nicht automatisch gesetzt).

Beispiel für spezifische Rollen: Du gibst test@test.ch die rolle `Leser (spezifisch)` auf einem Projekt. Nun kannst tu ihm auf Stufe Arten differenziert Rechte geben: Schreiber, Leser - oder keine. Wenn du ihm bei einer keine Art Rechte gibst, sieht er diese Art nicht.

Beispiel für generelle Rollen: Du gibst test@test.ch die rolle `Leser` auf einem Projekt. Er sieht nun automatisch ALLE aktuellen und künftigen Daten dieses Projekts. Du kannst ihm zusätzlich bei ausgewählten Arten Schreibrechte geben.

## Wie Rollen gesetzt werden

Eigentümer-Rollen werden automatisch von der App gesetzt und können nicht geändert werden.

Es ist wichtig zu wissen, dass die App beim Setzen von Rollen diese Rolle automatisch auf alle tieferen Ebenen kopiert. Das Setzen niedrigerer Rollen auf höheren Ebenen, nachdem auf tieferen Ebenen bereits höhere Rollen gesetzt wurden, führt dazu, dass die Rollen auf den tieferen Ebenen überschrieben werden. Daher **sollten Rollen von oben (Projekte) nach unten (Teilprojekte, Orte Ebene 1, Orte Ebene 2) gesetzt werden**.

Andererseits muss man Rollen auf (möglicherweise zahlreichen) tieferen Ebenen nur setzen, wenn man dort explizit differenzieren möchte. Sonst kann man sie einfach ignorieren.

Beim Erstellen neuer Teilprojekte und Orte kopiert die App automatisch die Rollen der nächsthöheren Ebene nach unten. Man muss sie also nur selber setzen, wenn sie explizit abweichen sollen.

## Ein Benutzer braucht bis ganz oben Rechte

Ein Leser, der auf einem Teilprojekt schreiben soll, benötigt die Leser-Rolle auf dem übergeordneten Projekt, um übergeordnete Daten zu synchronisieren, ohne die er nicht arbeiten könnte.
