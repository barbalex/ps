# Configuration

_Dernière mise à jour: 8 mai 2026_

---

## Pourquoi?

- [apflora.ch](https://apflora.ch) est [développé depuis 2005](https://apflora.ch/Dokumentation/geschichte) et illustre l'utilité d'un tel outil. Quelques expert·e·s en protection de la nature impliqué·e·s ont souhaité pouvoir l'utiliser dans d'autres projets aussi
- Il n'existe pas de solution «universelle» pour les projets de protection de la nature: la plupart des projets ne pourraient/devraient pas utiliser apflora.ch sans modifications
- Très peu d'institutions publiques ou de bureaux d'écologie peuvent ou veulent se permettre de développer un produit sur mesure comme https://apflora.ch, https://vermehrung.ch ou https://arteigenschaften.ch

## Quoi?

C'est pourquoi arten-fördern.app est très fortement configurable:

- Dénomination libre des sous-projets (p.ex. comme 'espèces' ou 'biotopes')
- Choix d'unités par défaut (à partir de listes définies soi-même, voir ci-dessous)
- Choix des fonctionnalités utilisées et de leur mode d'affichage
- Choix du nombre de niveaux pour les lieux (1 ou 2)
- Dénomination libre des niveaux de lieux
- Choix des fonctionnalités utilisées pour chaque niveau de lieu (mesures, contrôles, rapports etc.)
- Possibilité d'ajouter des champs personnalisés dans de nombreuses tables
  - Pour un booléen, choisir **boolean-buttons** pour distinguer **Non** de **Non évalué**. Les nouvelles fiches sont initialement non évaluées. Dans le filtre, **Non évalué** trouve les réponses manquantes et **Tous** supprime la restriction. Utiliser une liste de codes si d’autres états sont nécessaires.
  - Pour les champs de saisie entiers ou décimaux, on peut définir une unité, un minimum, un maximum et un pas. Ces réglages sont facultatifs. Les bornes sont incluses. Le pas est compté depuis le minimum, ou depuis zéro sans minimum. Par exemple, un minimum de 0,5 et un pas de 1 autorisent 0,5, 1,5, 2,5, etc. L’unité est uniquement affichée. Modifier les réglages ne change pas les données existantes.
  - Pour choisir une seule valeur dans une longue liste, utiliser **options-many**. Saisir une partie du libellé ou du code, puis sélectionner un résultat. La recherche seule ne modifie pas la valeur enregistrée.
  - Pour sélectionner plusieurs valeurs dans une liste, choisir **multiselect-few** (cases à cocher) ou **multiselect-many** (recherche). La liste doit correspondre au type du champ : texte, entier ou décimal (liste numérique). Les deux widgets enregistrent le même tableau de codes. Le filtre recherche au moins une valeur, ou toutes avec **Exiger toutes les valeurs sélectionnées**. Les exports de géométries contiennent les codes et une colonne `_label` dans le même ordre.
  - Dans un champ Markdown, sélectionner du texte puis utiliser la barre de mise en forme pour les titres, le gras, l’italique, les listes ou les liens. Sur petit écran, ouvrir **Autres formats**. Ctrl (Mac : ⌘) + B, I ou K applique le gras, l’italique ou insère un lien.
  - Choisir **text → rich-text** pour voir la mise en forme pendant la saisie. La barre propose titres, gras, italique, listes, liens, annulation et rétablissement. Le collage conserve la mise en forme prise en charge. Les notes sont enregistrées en Markdown même hors ligne et imprimées avec leur mise en forme.
  - Choisir **text → markdown** pour modifier directement la source Markdown, y compris les tableaux. **Aperçu** affiche le résultat mis en forme.
- Définition et import libres de taxonomies
- Définition et import libres de listes
- Sélection de graphiques prédéfinis, possibilité d'en créer soi-même
- Possibilité de créer des rapports personnalisés au niveau projet et sous-projet, avec intégration des graphiques
- Possibilité d'importer des observations de n'importe quelle source
- Intégration de diverses sources de couches cartographiques (WMS, WFS, imports...)
  - Pour les géométries réparties, sélectionner les fichiers ensemble, cocher les couches souhaitées et choisir le champ UUID de chaque couche (inutile pour un seul objet cible). L’ajout ou le remplacement est appliqué une seule fois par objet pour toutes les couches choisies. En cas d’erreur, rien n’est modifié.
  - **Exporter les géométries** dans une liste de lieux, actions ou contrôles exporte les objets affichés ayant une géométrie en WGS84. Choisir GeoPackage, GeoJSON, CSV (WKT) ou KML. Chaque objet conserve son UUID et ses attributs. Les codes des listes sont accompagnés, si possible, d’une colonne `_label`. Les champs personnalisés utilisent `data_<clé>` et un suffixe numérique en cas de conflit. À la réimportation, choisir la colonne UUID d’origine ; les autres attributs ne sont pas modifiés.
  - Pour partager un fichier SIG, choisir le type de couche vectorielle **Upload**. Formats : GeoPackage, Shapefile zippé (avec ses fichiers associés), GeoJSON, KML/KMZ, GPX, CSV et géodatabase fichier zippée. Choisir la couche et, pour un CSV, les colonnes X et Y. Vérifier le code EPSG source si demandé ; les coordonnées sont converties en WGS84.
  - Pour les projets, lieux, actions et contrôles, choisir **Importer des géométries** dans le menu géométrie de l’objet ou (sauf pour les projets) dans l’en-tête de liste. Les formats et les options de projection sont identiques. Dans une liste, choisir le champ UUID des objets affichés. Pour un seul objet, aucun identifiant n’est nécessaire. Par défaut, les géométries sont ajoutées. Le remplacement ne concerne que les objets correspondants. Il faut une connexion et des droits d’écriture ; pour les projets, des polygones et les droits de conception ou de propriété sont requis. Une erreur annule tout l’import. Les observations conservent leur géométrie dérivée.
  - L’importation nécessite une connexion et des droits d’écriture dans le projet. L’ajout conserve les objets existants ; le remplacement ne les supprime que si l’importation réussit. Après synchronisation, la couche peut être activée, stylisée et interrogée même hors ligne. Limites : 64 Mio par fichier, 256 Mio par archive décompressée.
- Choix libre du système de référence de coordonnées, possibilité de définir le sien
  - Le globe à côté de « Afficher le centre de la carte » permet de choisir entre WGS84 et les systèmes configurés dans le projet. En mode conception, ce choix modifie la valeur par défaut du projet ; sinon, il ne s’applique qu’à votre compte sur cet appareil.
- Sélection de contrôles qualité prédéfinis, possibilité d'en créer soi-même
- Sélection d'exports prédéfinis, possibilité d'en créer soi-même
- Disponible en 4 langues: allemand, français, italien, anglais

## Comment?

Tu dois réfléchir dès le tout début à la façon d'organiser ton projet de manière optimale et d'y utiliser arten-fördern.app.

Pour cela, tu as trois options:

### 1 «Je me lance et je m'occupe de la configuration quand ce sera nécessaire»

Je suis ravi si tu prends un abonnement pour cela. Mais il est probable que les choses auraient pu se passer bien mieux pour vous. Les modifications de configuration après coup peuvent être très coûteuses en temps et concerner toutes les personnes impliquées.

Si un projet est couronné de succès, il évolue au fil des années. Des ajustements et extensions ultérieurs sont donc rarement évitables même avec une bonne préparation. Mais ils peuvent être minimisés.

### 2 «Je prends du temps au départ et je configure moi-même»

Bonne idée. Dis-moi s'il te plaît ce que je devrais mieux documenter, et ce qui manque ou devrait fonctionner différemment pour ton projet.

### 3 «Je prends du temps au départ et je me fais accompagner»

Je développe certes des logiciels aujourd'hui, mais je [comprends aussi quelque chose à la protection de la nature](https://gabriel-software.ch/kontakt). Si je réfléchis avec toi, tu peux probablement réduire ton effort — ainsi que la probabilité ou l'ampleur des modifications ultérieures.

Ton projet et sa configuration optimale dans arten-fördern.app m'intéressent. Je serais donc heureux d'aider à planifier dès le départ gratuitement ou à des tarifs modestes, et de comptabiliser l'effort comme formation continue, réseautage et marketing.
