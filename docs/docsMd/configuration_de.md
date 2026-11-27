# Konfiguration

_Zuletzt aktualisiert am 8.5.2026_

---

## Wieso?

- [apflora.ch](https://apflora.ch) wird [seit 2005](https://apflora.ch/Dokumentation/geschichte) entwickelt und zeigt den Nutzen eines solchen Werkzeugs. Beteiligte Naturschutzfachleute haben gewünscht, es auch in anderen Projekten verwenden zu können
- Es gibt kein «one size fits all» für Naturschutzprojekte: Die meisten Projekte könnten/sollten apflora.ch nicht unverändert verwenden
- Nur die wenigsten öffentlichen Institutionen oder Ökobüros können oder wollen sich die Entwicklung eines massgeschneiderten Produkts wie z.B. https://apflora.ch, https://vermehrung.ch oder https://arteigenschaften.ch leisten

## Was?

Deshalb ist arten-fördern.app stark konfigurierbar:

- Freie Bennennung von Teilprojekten (z.B. als 'Arten' oder 'Biotope')
- Wahl, welche Fähigkeiten verwendet werden und wie sie angezeigt werden
- Wahl der Anzahl Stufen für Orte (1 oder 2)
- Freie Benennung der Ort-Stufen
- Wahl, in welchen Ort-Stufen welche Fähigkeiten genutzt werden (Massnahmen, Kontrollen, Berichte etc.)
- Möglichkeit in vielen Tabellen eigene Felder zu ergänzen
- Freie Definition und Import von Taxonomien
- Freie Definition und Import von Listen
- Wahl von Standard-Einheiten (aus selber definierten Listen)
- Wahl vorbereiteter Diagramme, Möglichkeit eigene zu bauen
- Möglichkeit, eigene Berichte zu bauen, auf Stufe Projekt und Teil-Projekt, mit Einbezug der Diagramme
- Möglichkeit, Beobachtungen aus jeglicher Quelle zu importieren
- Einbezug diverser Quellen für Karten-Layer (WMS, WFS, Importe...)
  - Bei einer Vektorebene im Projekt **Upload** wählen. Unterstützt werden GeoPackage, Shapefile im ZIP (mit Begleitdateien), GeoJSON, KML/KMZ, GPX, CSV und File Geodatabase im ZIP. Die Quellebene und bei CSV die X- und Y-Spalten auswählen. Bei Bedarf den EPSG-Code der Quelldaten prüfen; die Koordinaten werden nach WGS84 umgerechnet.
  - Für Projekte, Orte, Massnahmen und Kontrollen **Geometrien importieren** im Geometriemenü des Objekts oder im Listenkopf wählen. Formate und Koordinatensysteme sind dieselben. In Listen das UUID-Feld der angezeigten Objekte wählen; für ein einzelnes Objekt ist keine ID nötig. Standardmässig werden Geometrien hinzugefügt. Ersetzen betrifft nur die zugeordneten Objekte. Der Import erfordert eine Internetverbindung und Schreibrechte, Projektgebiete zusätzlich Polygone und die Rolle Gestaltung oder Eigentum. Bei einem Fehler wird nichts geändert. Beobachtungsgeometrien werden weiterhin aus den Quelldaten abgeleitet.
  - Der Import benötigt eine Verbindung und Schreibrechte im Projekt. Beim Hinzufügen bleiben vorhandene Objekte erhalten, beim Ersetzen werden sie erst nach erfolgreichem Import ausgetauscht. Nach der Synchronisation lässt sich die Ebene auch offline aktivieren, gestalten und abfragen. Grenzen: 64 MiB pro Datei, 256 MiB pro entpacktem Archiv.
- Freie Wahl des Koordinaten-Bezugs-Systems, Möglichkeit eigenes zu definieren
  - Über den Globus neben «Kartenmitte anzeigen» wechseln Sie zwischen WGS84 und den im Projekt konfigurierten Systemen. Im Gestaltungsmodus ändern Sie den Projektstandard, sonst gilt die Auswahl nur für Ihr Konto auf diesem Gerät.
- Wahl vorbereiteter Qualitätskontrollen, Möglichkeit eigene zu bauen
- Wahl vorbereiteter Exporte, Möglichkeit eigene zu bauen
- 4 Sprachig: Deutsch, Französisch, Italienisch, Englisch

## Wie?

Du musst ganz am Anfang überlegen, wie du dein Projekt optimal organisierst und arten-fördern.app dafür einsetzt.

Dafür hast du drei Varianten:

### 1 «Ich fange einfach mal an und kümmere mich um Konfiguration, wenn es nötig wird»

Es freut mich, wenn du dafür ein Abo löst. Aber es ist wahrscheinlich, dass es für euch hätte viel besser laufen können. Nachträgliche Konfigurations-Änderungen können sehr aufwändig sein und alle Mitarbeitenden betreffen.

Ist ein Projekt erfolgreich, entwickelt es sich über die Jahre weiter. Spätere Anpassungen/Erweiterungen sind daher auch bei guter Vorbereitung selten vermeidbar. Aber minimierbar.

### 2 «Ich nehme mir am Anfang viel Zeit und konfiguriere selbst»

Gute Idee. Sag mir bitte, was ich besser dokumentieren soll und was für dein Projekt fehlt oder anders funktionieren sollte.

### 3 «Ich nehme mir am Anfang Zeit und lasse mich dabei unterstützen»

Ich entwickle zwar heute Software, [verstehe aber auch einiges von Naturschutz](https://gabriel-software.ch/kontakt). Wenn ich mitdenke kannst du vermutlich deinen Aufwand und die Wahrscheinlichkeit oder das Ausmass späterer Änderungen reduzieren.

Dein Projekt und seine optimale Konfiguration in arten-fördern.app interessiert mich. Ich würde daher anfänglich gerne gratis oder zu bescheidenen Tarifen mit planen und den Aufwand als Weiterbildung, Vernetzung und Marketing abbuchen.
