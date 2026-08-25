# Booster Experience 1.6.0

## Objectif

Professionnaliser l’expérience de cartes et de boosters de **Pêche & Merveilles** sans abandonner son design simple, avec comme référence de satisfaction les ouvertures de boosters de jeux de cartes mobiles modernes.

Les panels ci-dessous sont **simulés** : ce ne sont pas des entretiens réels. Ils servent de revue structurée à partir du jeu actuel, de retours publics observables sur les jeux de cartes mobiles et de principes UX.

## Panel utilisateurs — tour 1

Profils :
- collectionneur quotidien ;
- joueur mobile pressé ;
- chasseur de raretés ;
- joueur sensible à la malchance ;
- joueur occasionnel ;
- joueur sur téléphone modeste.

Besoins convergents :
1. Un booster doit être un objet, pas seulement un bouton qui imprime trois lignes.
2. La révélation doit être séquentielle afin de créer de l’anticipation.
3. Une carte rare doit être reconnaissable visuellement avant de lire son texte.
4. L’animation doit rester accélérable.
5. Une mauvaise série doit montrer une progression vers une garantie.
6. Les boosters spéciaux doivent avoir des règles simples et visibles.
7. Les doublons doivent rester utiles et montrer immédiatement leur valeur.

## Panel experts — proposition 1

Expertises représentées :
- UX mobile ;
- game feel / motion design ;
- économie de jeu ;
- accessibilité ;
- performance webview Android ;
- collection / gacha responsable ;
- QA et migration de sauvegarde.

Décisions :
- passage de 3 à 5 cartes ;
- coût de 500 à 800 pièces pour limiter l’inflation créée par les deux spécimens supplémentaires ;
- 5e carte Inhabituelle+ ;
- protection Rare+ au plus tard en 4 boosters ;
- Booster Irisé tous les 5 boosters, 5e carte Rare+ ;
- Booster Abyssal tous les 15 boosters, 4e Rare+ et 5e Épique+ ;
- trois enveloppes standard purement cosmétiques : Marée bleue, Récif corail, Courant émeraude ;
- ouverture plein écran, déchirure courte, reveal carte par carte ;
- brillance progressive par rareté ;
- résumé final avec les cinq cartes, nouvelles cartes, doublons et meilleure rareté ;
- bouton « Tout révéler » ;
- respect de `prefers-reduced-motion` ;
- effets CSS/DOM uniquement, sans images lourdes.

## Panel utilisateurs — validation 2

Retours simulés :
- cinq cartes donnent enfin un rythme satisfaisant ;
- le booster spécial est motivant car son arrivée est prévisible ;
- inquiétude sur la répétition de l’animation après plusieurs ouvertures ;
- demande de voir l’utilité des doublons sans ouvrir une autre page ;
- demande d’un bilan après le cinquième reveal.

## Panel experts — itération 2

Ajustements :
- bouton « Tout révéler » disponible juste après la déchirure ;
- valeur du spécimen affichée directement sur chaque carte ;
- compteur de copies affiché pour les doublons ;
- progression `x / 5` ;
- résumé final et bouton « Ouvrir encore » ;
- compteur visible jusqu’au prochain Abyssal et jusqu’à la protection Rare+.

## Panel utilisateurs — validation 3

Retours simulés :
- expérience jugée suffisamment courte pour du jeu mobile ;
- hiérarchie de rareté lisible ;
- les boosters Irisé/Abyssal créent des rendez-vous sans dépendre d’un événement serveur ;
- préférence pour une interface sobre plutôt que des particules permanentes.

## Panel experts — finition

- particules limitées aux Rare+ ;
- animations essentiellement basées sur `transform` et `opacity` ;
- mode mouvement réduit sans animations décoratives ;
- aucune dépendance réseau ;
- aucune ressource bitmap supplémentaire ;
- migration de sauvegarde vers le schéma 7 ;
- tests dédiés aux garanties, au pity et aux boosters spéciaux.

## Itération 3 — revue d’intégration

La revue de code avant PR a détecté deux problèmes que les premiers panels n’avaient pas fait apparaître :
- la couche UI 1.5 et la couche UI 1.6 pouvaient se réécrire mutuellement les textes du booster via leurs `MutationObserver` ;
- avec un Irisé Rare+ garanti tous les 4 boosters, une pity à 6 boosters devenait presque décorative.

Corrections retenues :
- la couche UI 1.5 passe en mode compatibilité lorsqu’elle détecte le système 1.6 et ne pilote plus les textes/règles du booster ;
- pity Rare+ ramenée à 4 boosters ;
- Irisé déplacé à un cycle de 5 boosters ;
- Abyssal déplacé à un cycle de 15 boosters ;
- l’UI lit désormais ces cadences depuis `cardBoosterRules` au lieu de les recopier en dur ;
- fermer l’ouverture avant la fin affiche le bilan plutôt que de perdre silencieusement les informations du tirage ;
- ajout d’éléments d’accessibilité (`aria-live`, focus clavier) sans alourdir l’animation.

Cette troisième itération rend les systèmes de garantie complémentaires et supprime la boucle de rendu potentielle.

## Critères d’acceptation

- [x] 5 cartes par booster.
- [x] Reveal séquentiel.
- [x] Ouverture accélérable.
- [x] Rare+ protégée au plus tard en 4 boosters.
- [x] Irisé tous les 5 boosters.
- [x] Abyssal tous les 15 boosters.
- [x] Épique+ garantie sur la dernière carte Abyssale.
- [x] Identité visuelle de toutes les raretés.
- [x] Résumé final.
- [x] Doublons et valeur visibles.
- [x] `prefers-reduced-motion`.
- [x] Tests de non-régression logique.
