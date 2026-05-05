# Rôles utilisateurs

*Dernière mise à jour: 5 mai 2026*

---

## Propriété

Un utilisateur est propriétaire:

- de sa propre fiche utilisateur,
- des comptes associés,
- des projets
- et de toutes les données créées dans ces projets.

Les rôles Propriétaire sont définis automatiquement par l'app et ne peuvent pas être modifiés.

## Rôles

Les rôles sont listés du plus élevé au plus bas:

1. **Propriétaire**: peut attribuer des rôles Designer
2. **Designer**: peut modifier les configurations de projets et de sous-projets, attribuer des rôles Rédacteur et Lecteur
3. **Rédacteur**: peut modifier toutes les données
4. **Rédacteur (spécifique)**: peut modifier les données pour lesquelles ce rôle lui a été attribué
5. **Lecteur**: peut synchroniser et lire toutes les données
6. **Lecteur (spécifique)**: peut synchroniser et lire les données pour lesquelles ce rôle lui a été attribué

Un rôle inclut toujours tous les rôles inférieurs. Ils ne sont pas définis séparément — un seul rôle doit être défini par niveau.

Il existe des rôles _spécifiques_. Les autres s'appliquent _généralement_. Plus de détails ci-dessous.

## Où les rôles sont attribués

Les rôles sont attribués à quatre niveaux:

1. Projets
2. Sous-projets (espèces ou biotopes)
3. Lieux niveau 1, par ex. populations
4. Lieux niveau 2, par ex. sous-populations

## Comment fonctionnent les rôles généraux

Lorsqu'un rôle général est défini, son effet s'étend à tous les niveaux inférieurs. L'app définit automatiquement tous les rôles des niveaux inférieurs.

Des droits supérieurs peuvent être accordés à des niveaux inférieurs, leur effet s'étendant également vers le bas. La définition de droits inférieurs à des niveaux inférieurs n'est prise en charge que pour les rôles spécifiques.

Il est important de savoir que lors de la définition de rôles généraux, l'app copie automatiquement ce rôle à tous les niveaux inférieurs. Ainsi, **les rôles généraux doivent être attribués de haut en bas (projets → sous-projets → lieux niveau 1 → lieux niveau 2)**.

Exemple: si tu donnes à test@test.ch le rôle Lecteur sur le projet, l'app lui attribue automatiquement des rôles Lecteur dans tous les sous-projets et lieux. Tu peux en outre lui accorder des droits d'écriture sur des sous-projets ou lieux spécifiques.

## Comment fonctionnent les rôles spécifiques

Les rôles spécifiques permettent d'accorder à un utilisateur des droits uniquement sur une partie des données. Lorsqu'un rôle spécifique est choisi, les rôles au niveau immédiatement inférieur doivent donc être attribués manuellement (ils ne sont pas définis automatiquement).

Exemple: tu donnes à test@test.ch le rôle `Lecteur (spécifique)` sur un projet. Tu peux ensuite lui accorder des droits différenciés au niveau des sous-projets: Rédacteur, Lecteur — ou aucun. Si tu ne lui accordes aucun droit sur un sous-projet, il ne verra pas ce sous-projet.

## Les utilisateurs ont besoin de droits jusqu'au sommet

Il ne suffit pas de donner à un utilisateur qui doit travailler sur un sous-projet des droits d'écriture sur ce sous-projet uniquement. Il a besoin du rôle Lecteur sur le projet parent pour synchroniser les données parentes, sans lesquelles il ne pourrait pas travailler.
