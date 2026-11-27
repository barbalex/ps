# Exports

*Dernière mise à jour: 27 novembre 2026*

---

Les exports permettent de:

1. Exporter des parties des données
2. Générer des requêtes personnalisées

Formats:

- .csv (simple, utilisable partout)
- .ods (pour les tableurs)
- .xlsx (pour les tableurs)

Les utilisateurs ayant le rôle « Propriétaire » ou « Concepteur » peuvent choisir lesquels des exports préparés sont disponibles — et peuvent en créer de nouveaux.

Les exports sont disponibles au niveau du projet et du sous-projet (espèce/biotope).

Tu veux filtrer l'export? Tu peux définir un filtre quelconque sur la table de base dans le formulaire de filtre, puis l'appliquer lors de l'exécution de l'export.

## Ouvrir un projet dans QGIS

Pour créer une carte, ouvre le projet et choisis **Exporter le projet → GeoPackage (.gpkg)** dans son en-tête. Glisse le fichier téléchargé dans QGIS et sélectionne les couches voulues. Un GeoPackage est une base SQLite qui indique à QGIS les colonnes géométriques et leur système de coordonnées. Aucun export SpatiaLite supplémentaire n’est nécessaire.

Si tous les lieux sont des points, sélectionne `places`. Si la table contient plusieurs types de géométrie, choisis les couches correspondantes, par exemple `places_points` ou `places_lines`. Utilise `place_id` pour les joindre aux attributs de `places`. Les lieux sans géométrie restent dans la table mais ne figurent pas sur la carte.

### Tu as déjà un export SQLite?

**SQLite (.sqlite)** convient aux requêtes et aux jointures. Les géométries y sont stockées sous forme de texte GeoJSON: QGIS ouvre donc `places` comme une table. Pour afficher les points sans modifier le fichier:

1. Glisse le fichier `.sqlite` dans QGIS, ajoute la table `places` et renomme la couche `places_raw`.
2. Dans **Couche → Ajouter une couche**, ouvre le dialogue des couches virtuelles.
3. Colle cette requête et clique sur **Ajouter**:

```sql
SELECT p.place_id, p.name,
       SetSRID(CastToMultiPoint(CollectionExtract(GeomFromGeoJSON(p.geometry), 1)), 4326) AS geom
FROM places_raw AS p
WHERE p.geometry IS NOT NULL
```

La couche virtuelle affiche tous les points en WGS 84 (EPSG:4326), mais ni les lignes ni les polygones.
