# Panel simulé de validation — Pêche & Merveilles

## Personas

1. **Léa, 27 ans — joueuse mobile casual**  
   Sessions de 5 à 10 minutes, joue d'une main, abandonne vite si la boucle n'est pas comprise immédiatement.

2. **Mehdi, 34 ans — collectionneur/completionist**  
   Veut savoir ce qui lui manque, pourquoi c'est verrouillé, et sentir que chaque session rapproche clairement du 100 %.

3. **Chloé, 25 ans — habituée des gachas**  
   Très sensible aux probabilités opaques, aux doublons frustrants et aux monnaies qui donnent l'impression d'être gaspillées.

4. **Thomas, 31 ans — joueur impatient**  
   Veut une première récompense significative rapidement et déteste les actions répétitives sans micro-décision.

5. **Nina, 42 ans — découvre les jeux de collection**  
   Ne connaît pas les conventions du gacha. A besoin d'un tutoriel très court et de libellés explicites.

## Itération 1 — constats

- La pêche était trop passive : une simple pression suivie d'une récompense donnait peu de sensation de jeu.
- La collection montrait les cartes mais expliquait mal les verrouillages et donnait peu d'informations sur une créature possédée.
- La progression finale était trop longue pour un prototype mobile destiné à faire tester la boucle complète.
- Les utilisateurs familiers des gachas voulaient connaître les probabilités et éviter les doublons inutiles.

## Changements appliqués

- Ajout d'un ferrage à déclencher au moment où le bouchon mord, avec fenêtre d'échec et vibration.
- Ajout d'une série de ferrages qui améliore légèrement les chances relatives des raretés élevées.
- Ajout des fiches de cartes avec valeur, rang d'accès et nombre de captures.
- Affichage du rang requis sur les cartes verrouillées.
- Gacha limité aux espèces jamais débloquées et accessibles au rang courant : zéro doublon tant qu'une nouvelle espèce est disponible.
- Affichage des probabilités actuelles du gacha.
- Tutoriel en trois écrans : pêcher, vendre, débloquer.
- Courbe finale ramenée à 420 prises vendues pour atteindre le rang 10.

## Itération 2 — validation simulée

### Léa
**Verdict : validé.** La boucle principale est comprise sans texte externe et les quatre onglets correspondent aux quatre actions attendues.

### Mehdi
**Verdict : validé.** Le compteur 3/100, les filtres et les rangs requis rendent la complétion lisible. Les cartes gagnent en identité visuelle selon leur rareté.

### Chloé
**Verdict : validé.** Les probabilités sont consultables et le tirage ne consomme pas de monnaie si aucune nouvelle espèce n'est accessible. L'absence de doublons évite la frustration principale du prototype.

### Thomas
**Verdict : validé.** Les trois poissons de départ valent environ 19 à 21 pièces et le premier tirage coûte 80 pièces : le premier nouveau déblocage arrive après environ quatre à cinq prises vendues. Le ferrage évite une boucle entièrement automatique.

### Nina
**Verdict : validé.** Le tutoriel explique les trois concepts sans jargon nécessaire et le marché indique explicitement que le nombre de ventes fait progresser le rang.

## Critères de sortie fonctionnels

- 100 créatures uniques configurées : **OK**
- 3 créatures communes débloquées au démarrage : **OK**
- Plusieurs raretés avec design de carte distinct : **OK**
- Pêche jouable et non purement passive : **OK**
- Vente contre monnaie : **OK**
- Gacha achetable avec cette monnaie : **OK**
- Chaque tirage débloque une nouvelle créature accessible : **OK**
- Créatures avancées bloquées par la progression : **OK**
- Carte ajoutée à la collection après déblocage : **OK**
- Sauvegarde locale de la progression : **OK**
- Tests de logique automatisés : **OK**
- Compilation APK Android : **à valider par la CI du repo fishinggame avant livraison**
