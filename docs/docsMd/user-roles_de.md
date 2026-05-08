# Benutzer-Rollen

_Zuletzt aktualisiert am 8.5.2026_

---

## Eigentümerschaft

Ein Benutzer ist Eigentümer:

- seines eigenen Benutzer-Datensatzes,
- der zugehörigen Konten,
- Projekte
- und aller in diesen Projekten enthaltenen Daten.

Eigentümer-Rollen werden automatisch von der App gesetzt und können nicht geändert werden.
Wie im richtigen Leben ist Eigentum nicht nur ein Privileg, sondern auch eine Last 😁: [Es sind die Eigentümer, die arten-fördern.app finanzieren](/docs/pricing).

## Rollen

Rollen sind von hoch nach tief:

1. **Eigentümer**: kann Designer-Rollen vergeben
2. **Designer**: kann Projekte und Teilprojekte erstellen und konfigurieren, Schreiber- und Leser-Rollen vergeben
3. **Schreiber**: kann alle Daten bearbeiten
4. **Schreiber (spezifisch)**: kann Daten bearbeiten, für die er die entsprechende Rolle zugewiesen bekommt
5. **Leser**: kann alle Daten synchronisieren und lesen
6. **Leser (spezifisch)**: kann Daten synchronisieren und lesen, für die er die entsprechende Rolle zugewiesen bekommt

Eine Rolle schliesst immer alle niedrigeren Rollen ein - es wird pro Ebene nur eine einzige Rolle gesetzt.

Es gibt _spezifische_ Rollen. Die übrigen gelten _generell_. Mehr dazu weiter unten.

## Wo Rollen vergeben werden

Rollen werden auf vier Ebenen vergeben:

1. Projekte
2. Teilprojekte (Arten oder Biotope)
3. Orte Ebene 1, z.B. Populationen
4. Orte Ebene 2, z.B. Teilpopulationen

## Wie generelle Rollen funktionieren

Wenn eine generelle Rolle gesetzt wird, erstreckt sich ihre Wirkung auf alle tieferen Ebenen. Die App setzt automatisch alle niedrigeren Rollen.

Auf tieferen Ebenen können höhere Rechte vergeben werden. Ihre Wirkung erstreckt sich ebenfalls nach unten. Das Setzen niedrigerer Rechte auf tieferen Ebenen wird nur bei spezifischen Rollen unterstützt.

Es ist wichtig zu wissen, dass die App beim Setzen von generellen Rollen diese Rolle automatisch auf alle tieferen Ebenen kopiert. Daher **sollten generelle Rollen von oben (Projekte) nach unten (Teilprojekte, Orte Ebene 1, Orte Ebene 2) vergeben werden**.

Beispiel: Gibst du test@test.ch die Leser-Rolle auf dem Projekt, gibt ihm die App automatisch Leser-Rollen in allen Teilprojekten und Orten. Du kannst ihm zusätzlich auf bestimmten Teilprojekten oder Orten Schreibrechte geben.

## Wie spezifische Rollen funktionieren

Spezifische Rollen sind dazu da, einem Benutzer nur für einen Teil der Daten Rechte zu geben. Wählt man eine spezifische Rolle, müssen daher in der nächsttieferen Stufe die Rollen manuell vergeben werden, sie werden nicht automatisch gesetzt.

Beispiel: Du gibst test@test.ch die rolle `Leser (spezifisch)` auf einem Projekt. Nun kannst tu ihm auf Stufe Arten differenziert Rechte geben: Schreiber, Leser - oder keine. Wenn du ihm bei einer keine Art Rechte gibst, sieht er sie nicht.

## Benutzer brauchen bis ganz oben Rechte

Es reicht nicht, einem Benutzer, der an einem Teilprojekt arbeiten soll, auf diesem Teilprojekt 'Schreiber' zu geben. Er benötigt die Leser-Rolle auf dem übergeordneten Projekt, um übergeordnete Daten zu synchronisieren. Denn ohne diese könnte er nicht arbeiten.

Gib ihm also auf dem Projekt 'Leser (spezifisch)', wenn er nur dieses Teilprojekt sehen soll. Oder 'Leser', wenn er alle Teilprojekte sehen soll.
