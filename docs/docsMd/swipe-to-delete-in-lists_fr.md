# Glisser pour supprimer dans les listes

Dernière mise à jour: 17 avril 2026

## Aperçu

Les lignes de liste prennent désormais en charge un geste de glissement pour supprimer, offrant une suppression intuitive avec un retour visuel et une confirmation.

## Fonctionnalités implémentées

### 1. Glisser à droite pour afficher l'icône de suppression

- Les utilisateurs peuvent faire glisser n'importe quelle ligne vers la droite si elle possède la propriété `onDelete`
- Une icône de corbeille (🗑️) apparaît derrière la ligne lors du glissement
- L'icône est initialement blanche/grise pour un retour visuel discret

### 2. Retour visuel au seuil de 30 %

- Lorsque le glissement dépasse 30 % de la largeur de la ligne, l'icône de suppression passe du blanc au rouge
- Cela fournit un retour visuel clair indiquant que le seuil de suppression a été atteint
- Le changement de couleur signale à l'utilisateur que relâcher déclenchera l'étape suivante

### 3. Boutons Confirmer/Annuler

- Lorsque le glissement est relâché au-delà du seuil de 30 %, deux boutons d'action apparaissent:
  - **Bouton Confirmer (✓)**: Bouton circulaire rouge pour confirmer la suppression
  - **Bouton Annuler (✕)**: Bouton circulaire gris pour annuler l'action
- Les boutons sont positionnés dans les 30 % gauches de la ligne
- Cliquer sur Confirmer déclenche le callback `onDelete`
- Cliquer sur Annuler remet la ligne dans son état normal

### 4. Animations fluides

- La ligne glisse fluidement pendant le geste
- Si elle est relâchée avant le seuil de 30 %, elle revient en douceur à sa position initiale
- Toutes les transitions utilisent un easing pour une expérience utilisateur soignée

## Utilisation

Pour activer le glissement pour supprimer sur une ligne, passez une fonction de callback `onDelete`:

```tsx
<Row
  label="Mon élément"
  to="/chemin"
  onDelete={() => {
    // Logique de suppression ici
    deleteItem(itemId)
  }}
/>
```

Les lignes sans la propriété `onDelete` continueront à fonctionner normalement, sans le geste de glissement.

## Implémentation technique

- Les événements tactiles (`onTouchStart`, `onTouchMove`, `onTouchEnd`) suivent les gestes de glissement
- La gestion d'état traite le décalage du glissement et le mode de confirmation
- Les transformations CSS fournissent un retour visuel fluide
- La fonctionnalité est entièrement encapsulée dans le composant Row
