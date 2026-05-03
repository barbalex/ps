# Rôles utilisateurs

*Dernière mise à jour: 17 avril 2026*

---

## Propriété

Un utilisateur est propriétaire:

- de sa propre ligne utilisateur,
- des comptes associés,
- des projets
- et de toutes les données créées dans ces projets.

## Rôles

Les types de rôles sont (du plus élevé au plus bas):

1. **Propriétaire**: peut attribuer des rôles Designer
2. **Designer**: peut modifier la configuration des projets et sous-projets, attribuer des rôles Rédacteur et Lecteur
3. **Rédacteur**: peut modifier des données
4. **Lecteur**: peut synchroniser et lire des données

Un rôle inclut toujours tous les rôles inférieurs. Ils ne sont pas définis séparément — un seul rôle doit être défini par niveau.

## Où les rôles sont attribués

Les rôles sont attribués à quatre niveaux:

1. projets
2. sous-projets (espèces ou biotopes)
3. lieux (niveaux 1 et 2, par exemple: populations et sous-populations)

## Comment fonctionnent les rôles

Lorsqu'un rôle est défini, son effet s'étend à tous les niveaux inférieurs. L'app définit automatiquement tous les rôles des niveaux inférieurs.

Exemple: lorsque test@test.ch reçoit le rôle Rédacteur sur le projet, l'app lui attribue automatiquement des rôles Rédacteur dans tous les sous-projets et lieux.

La définition de droits inférieurs à un niveau inférieur n'est pas prise en charge. Exemple: si un utilisateur a le rôle Lecteur sur un projet, toutes ses données sont synchronisées sans vérifier les rôles aux niveaux inférieurs.

Des droits supérieurs peuvent être accordés à des niveaux inférieurs, leur effet s'étendant également vers le bas. Exemple inverse: un Lecteur qui doit être Rédacteur sur un sous-projet a besoin du rôle Lecteur sur le projet parent pour synchroniser les données parentes, sans lesquelles il ne pourrait pas travailler.

## Comment définir les rôles

Les rôles Propriétaire sont définis automatiquement par l'app et ne peuvent pas être modifiés.

Il est important de savoir que lorsque tu définis des rôles, l'app copie automatiquement ce rôle à tous les niveaux inférieurs. Définir des rôles inférieurs à des niveaux supérieurs après avoir défini des rôles supérieurs à des niveaux inférieurs entraînera l'écrasement des rôles aux niveaux inférieurs. Ainsi, **les rôles doivent être définis de haut en bas (projets → sous-projets → lieux niveau 1 → lieux niveau 2)**.

D'autre part, tu ne dois définir des rôles sur les niveaux inférieurs (potentiellement nombreux) que si tu souhaites explicitement différencier. Sinon, tu peux simplement les ignorer.

Lors de la création de nouveaux sous-projets et lieux, l'app copie automatiquement les rôles du niveau immédiatement supérieur. Tu n'as donc à les définir toi-même que s'ils doivent explicitement différer.
