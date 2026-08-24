# Panel simulé de validation — Pêche & Merveilles

## Personas

1. **Léa, 27 ans — joueuse mobile casual** : sessions de 5 à 10 minutes, veut comprendre sans manuel.
2. **Mehdi, 34 ans — collectionneur** : veut voir ce qui manque, les rangs requis et la progression vers le 100 %.
3. **Chloé, 25 ans — habituée des gachas** : sensible aux probabilités opaques et aux doublons frustrants.
4. **Thomas, 31 ans — joueur impatient** : veut un premier tirage vite et une action de pêche qui ne soit pas totalement automatique.
5. **Nina, 42 ans — découvre le genre** : a besoin de libellés simples et d'une boucle lisible.

## Itération 1 — retours

- La pêche devait être plus active qu'un bouton récompense.
- Le gacha devait éviter les doublons inutiles.
- Les cartes verrouillées devaient expliquer clairement le rang requis.
- Le premier tirage devait arriver rapidement.

## Changements appliqués

- Ferrage actif avec fenêtre de réussite/échec.
- Série de ferrages conservée en état de jeu.
- 100 créatures, 6 raretés, 10 rangs.
- 3 créatures communes débloquées au démarrage.
- Gacha garanti sur une nouvelle espèce accessible, sans doublon tant qu'une nouveauté existe.
- Collection avec cartes, rareté visuelle et indication de verrouillage.
- Sauvegarde locale via WebView/localStorage.

## Validation simulée finale

- **Léa : validé.** La navigation Pêche / Marché / Gacha / Collection est comprise rapidement.
- **Mehdi : validé.** Les compteurs et rangs rendent la complétion lisible.
- **Chloé : validé.** Le gacha sans doublon est jugé équitable pour un prototype.
- **Thomas : validé.** Le premier tirage est accessible après quelques ventes, et le ferrage évite la pure attente.
- **Nina : validé.** Les textes d'aide intégrés suffisent pour comprendre la boucle.

## Critères

- 100 éléments pêchables : OK
- 3 cartes communes au départ : OK
- Vente contre monnaie : OK
- Gacha contre monnaie : OK
- Nouvelle créature pêchable après tirage : OK
- Raretés et verrous de progression : OK
- Collection sous forme de cartes : OK
- Tests automatisés de logique : OK
- APK Android : à confirmer par CI avant livraison.
