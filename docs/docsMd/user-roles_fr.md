# Rôles utilisateurs

## Propriété

Un utilisateur est propriétaire de sa propre ligne utilisateur, des comptes associés, des projets et de toutes les données créées dans ces projets.

## Rôles

Les types de rôles sont (du plus élevé au plus bas):

1. Propriétaire: peut attribuer des rôles Gestionnaire
2. Gestionnaire: peut modifier la configuration des projets et sous-projets, peut attribuer des rôles Éditeur et Lecteur
3. Éditeur: peut modifier des données
4. Lecteur: peut synchroniser et lire des données

Un type de rôle inclut toujours tous les types de rôles inférieurs. Ils ne sont pas définis séparément — un seul rôle doit être défini par niveau.
Un rôle est la combinaison d'un utilisateur et d'un type de rôle.

## Où les rôles sont attribués

Les rôles sont attribués à quatre niveaux:

1. projets
2. sous-projets (espèces ou biotopes)
3. lieux (niveaux 1 et 2, par exemple: populations et sous-populations)

## Comment fonctionnent les rôles

Lorsqu'un rôle est défini, son effet s'étend à tous les niveaux inférieurs. L'app définit automatiquement tous les rôles des niveaux inférieurs.

Exemple: lorsque l'utilisateur test@test.ch reçoit le rôle Éditeur sur le projet, l'app lui attribue automatiquement des rôles Éditeur dans tous les sous-projets et lieux.

La définition de droits inférieurs à un niveau inférieur n'est pas prise en charge. Exemple: lorsqu'un utilisateur a le rôle Lecteur sur un projet, toutes ses données peuvent être synchronisées sans vérifier les niveaux inférieurs.

Des droits supérieurs peuvent être accordés à des niveaux inférieurs, leur effet s'étendant également vers le bas. Exemple: un Lecteur qui doit être Éditeur sur un sous-projet a besoin du rôle Lecteur sur son projet parent pour synchroniser les données parentes sans lesquelles il ne pourrait pas travailler.

## Comment définir les rôles

Les rôles Propriétaire sont définis automatiquement par l'app et ne peuvent pas être modifiés.

Il est important de savoir que lorsque vous définissez des rôles, l'app copie automatiquement ce rôle à tous les niveaux inférieurs. Définir des rôles inférieurs à des niveaux supérieurs après avoir défini des rôles supérieurs à des niveaux inférieurs entraînera l'écrasement des rôles aux niveaux inférieurs. Ainsi, **les rôles doivent être définis de haut en bas (projets → sous-projets → lieux niveau 1 → lieux niveau 2)**.

D'autre part, vous ne devez définir des rôles sur les niveaux inférieurs (potentiellement nombreux) que si vous souhaitez explicitement différencier. Sinon, vous pouvez simplement les ignorer.

Lors de la création de nouveaux sous-projets et lieux, l'app copie automatiquement les rôles du niveau immédiatement supérieur. Vous n'avez donc à les définir que s'ils doivent explicitement différer.
