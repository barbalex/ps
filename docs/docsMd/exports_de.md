# Exporte

_Zuletzt aktualisiert am 27.11.2026_

---

Exporte ermöglichen es:

1. Teile der Daten zu exportieren
2. Eigene Abfragen zu generieren

Formate:

- .csv (einfach, generell benutzbar)
- .ods (für Tabellen-Dokumente)
- .xlsx (für Tabellen-Dokumente)

Benutzer mit der Rolle "Eigentümer" oder "Designer" können wählen, welche der vorbereiteten Exporte zur Verfügung stehen. Und eigene generieren.

Exporte gibt es auf Stufe Projekt und Teil-Projekt (Art/Biotop).

Willst du den Export filtern? Du kannst auf der Basis-Tabelle im Filter-Formular einen beliebigen Filter setzen und diesen dann beim Export anwenden.

## Ein Projekt in QGIS öffnen

Für eine Karte öffnest du das Projekt und wählst in der Kopfzeile **Projekt exportieren → GeoPackage (.gpkg)**. Ziehe die heruntergeladene Datei in QGIS und wähle die gewünschten Layer. Ein GeoPackage ist eine SQLite-Datenbank, in der QGIS die Geometriespalten und ihr Koordinatensystem erkennt. Ein separater SpatiaLite-Export ist nicht nötig.

Sind alle Orte Punkte, wähle `places`. Enthält die Tabelle Punkte, Linien und Polygone gemischt, wähle die entsprechenden Layer, etwa `places_points` oder `places_lines`. Über `place_id` kannst du sie mit den Attributen aus `places` verknüpfen. Orte ohne Geometrie bleiben in der Tabelle, erscheinen aber nicht auf der Karte.

### Du hast bereits einen SQLite-Export?

**SQLite (.sqlite)** eignet sich für Abfragen und Tabellenverknüpfungen. Die Geometrien sind als GeoJSON-Text gespeichert, deshalb öffnet QGIS `places` als Tabelle. So zeigst du die Punkte an, ohne die Datei zu verändern:

1. Ziehe die `.sqlite`-Datei in QGIS, füge die Tabelle `places` hinzu und benenne den Layer in `places_raw` um.
2. Öffne im Menü **Layer → Layer hinzufügen** den Dialog für virtuelle Layer.
3. Füge diese Abfrage ein und klicke auf **Hinzufügen**:

```sql
SELECT p.place_id, p.name,
       SetSRID(CastToMultiPoint(CollectionExtract(GeomFromGeoJSON(p.geometry), 1)), 4326) AS geom
FROM places_raw AS p
WHERE p.geometry IS NOT NULL
```

Der virtuelle Layer zeigt alle Punktgeometrien in WGS 84 (EPSG:4326). Linien und Polygone werden nicht dargestellt.
