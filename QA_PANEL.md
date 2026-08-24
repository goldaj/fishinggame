# Panel simulé de validation — Pêche & Merveilles 1.1

## Personas

1. **Léa, 27 ans — joueuse mobile casual** : sessions courtes, veut comprendre la pêche sans lire un manuel.
2. **Mehdi, 34 ans — collectionneur** : veut une progression longue, savoir ce qui manque et pourquoi une espèce est verrouillée.
3. **Chloé, 25 ans — habituée des gachas** : veut un système lisible, sans doublons inutiles ni probabilités trompeuses.
4. **Thomas, 31 ans — joueur impatient** : essaie naturellement de spammer les actions et révèle vite les boucles exploitables.
5. **Nina, 42 ans — découvre le genre** : a besoin d'états visuels et de libellés simples pour comprendre le bon moment.

## Problèmes observés sur la version précédente

- Le bouton de pêche pouvait être spammé sans vraie sanction, ce qui neutralisait la mécanique de timing.
- La fenêtre de ferrage était fixe et beaucoup trop permissive.
- La rareté n'avait pratiquement aucun impact sur la difficulté réelle de capture.
- Trois espèces étaient disponibles dès le départ et les premiers tirages arrivaient trop vite pour un jeu censé reposer sur la patience.
- La progression de rang allait de 8 ventes pour le rang 2 à seulement 420 ventes pour le rang 10.
- L'interface était fonctionnelle mais ressemblait encore à un prototype : hiérarchie faible, états de pêche peu distincts, marché et gacha peu contextualisés.
- Les APK de développement étaient signés par une clé debug de runner et ne constituaient pas une identité de mise à jour durable.

## Itération 1.1 — changements appliqués

### Pêche

La pêche utilise maintenant cinq états explicites :

1. **Repos** : appuyer lance la ligne.
2. **Ligne à l'eau, aucun poisson présent** : appuyer relève la canne sans capture.
3. **Poisson présent mais trop tôt** : appuyer fait fuir le poisson et casse la série.
4. **Fenêtre de ferrage** : appuyer capture le poisson.
5. **Trop tard** : appuyer ou attendre la fin fait rater le poisson et casse la série.

Les durées sont tirées aléatoirement dans des bornes contrôlées à chaque tentative. La fenêtre gagnante diminue avec la rareté : environ 0,98–1,38 s pour une commune, 0,82–1,18 s pour une inhabituelle, 0,66–0,98 s pour une rare, 0,52–0,82 s pour une épique, 0,41–0,66 s pour une légendaire et 0,32–0,50 s pour la mythique. Il n'y a pas de jet de dé caché après un clic réussi : la difficulté vient du timing observable.

### Progression

- Nouvelle partie : **1 seule espèce commune** débloquée.
- Coût du premier gacha : **450 pièces** au lieu de 80.
- Coûts progressifs jusqu'à **2 800 pièces** en fin de collection.
- Paliers de rang : **0, 40, 120, 260, 480, 800, 1 250, 1 850, 2 700, 3 800 ventes**.
- Les espèces sont réparties en vagues de déblocage par rang ; le Kraken des marées reste mythique et rang 10.
- Le gacha reste sans doublon tant qu'une nouveauté éligible existe.
- Répartition des 100 créatures inchangée : 40 communes, 25 inhabituelles, 18 rares, 10 épiques, 6 légendaires et 1 mythique.

### UX / UI

- Hiérarchie visuelle plus nette, toujours sombre et sobre.
- États de pêche différenciés par texte, animation du bouchon, ondulation, indicateur d'état et vibrations.
- Boutons principaux et navigation basse de 56 px minimum pour des cibles tactiles confortables.
- Marché avec résumé du panier avant vente.
- Gacha avec coût, nombre de nouveautés accessibles et répartition du pool actuel.
- Collection plus lisible, filtres persistants, difficulté affichée sur les espèces découvertes et rang requis sur les espèces verrouillées.
- Gestion native des `WindowInsets` Android 15 conservée pour éviter le chevauchement avec la barre système.

## Validation simulée finale

- **Léa : validé.** Elle comprend que le premier frémissement n'est pas encore le signal grâce au texte « ce n'est pas encore la vraie touche ». Les états sont assez contrastés sans surcharger l'écran.
- **Mehdi : validé.** La progression est désormais suffisamment longue pour que la collection de 100 espèces ait un sens. Les rangs et verrous sont visibles avant le déblocage.
- **Chloé : validé.** Le coût et le pool sont visibles, le gacha reste sans doublon et la difficulté de pêche n'est pas un pourcentage caché après le clic.
- **Thomas : validé.** Le spam est désormais auto-punitif : pendant l'attente il remonte la ligne, pendant l'approche il rate le poisson. Il doit effectivement observer le signal.
- **Nina : validé.** Le changement de libellé, de statut, d'animation et la vibration rendent la séquence attente → présence → touche compréhensible après quelques essais.

## Critères de sortie 1.1

- 100 éléments pêchables et répartition des raretés inchangée : **OK**
- 1 seule espèce commune au démarrage : **OK**
- Appui sans poisson = ligne relevée : **OK**
- Appui trop tôt = poisson raté : **OK**
- Appui dans la fenêtre = capture : **OK**
- Appui trop tard / absence de réaction = poisson raté : **OK**
- Fenêtre plus étroite avec la rareté : **OK**
- Durées variables dans des bornes contrôlées : **OK**
- Progression fortement ralentie : **OK**
- Vente contre monnaie et gacha contre monnaie : **OK**
- Gacha sans doublon parmi les nouveautés éligibles : **OK**
- Raretés et verrous de progression : **OK**
- Collection sous forme de cartes : **OK**
- Interface mobile sobre et retravaillée : **OK**
- Tests automatisés étendus : **OK**
- Identité de signature durable documentée et clé privée tenue hors du dépôt public : **OK**
- APK release signé avec cette identité et certificat SHA-256 vérifié : **OK**
