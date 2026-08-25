# Booster Experience 1.7.0 — tactile pass

## Objectif

Faire de l'ouverture d'un booster une petite séquence tactile, manipulable et observable, plutôt qu'une animation commandée par des boutons.

Les panels ci-dessous sont simulés. Ils servent de méthode de revue structurée. Les références externes sont utilisées uniquement pour identifier des patterns d'interaction éprouvés.

## Références étudiées

- Nintendo Life, review de Pokémon TCG Pocket : le swipe de déchirure est décrit comme une partie cinétique et satisfaisante de l'ouverture.
- The Guardian, review de Pokémon TCG Pocket : sélection/manipulation du booster, déchirure au doigt, cartes révélées avec suspense, cartes rares admirables en mouvement.
- Gamereactor : sélection physique du pack, drag du doigt pour déchirer puis swipe des cartes une à une.
- Pratt Institute, critique UX : importance des signifiants visuels pour rendre les gestes découvrables et du feedback pendant les actions.
- Forum officiel Pokémon : retours d'utilisateurs signalant que les gestes obligatoires peuvent devenir frustrants lorsqu'ils sont mal reconnus ou sur des appareils plus modestes.

## Panel utilisateurs — tour 1

Profils représentés : collectionneur, joueur mobile rapide, joueur tactile, chasseur de raretés, joueur occasionnel, utilisateur de téléphone modeste, utilisateur préférant peu d'animations.

Demandes convergentes :
1. Déchirer réellement le booster avec le doigt.
2. Voir la tranche des cartes avant la révélation pour chercher un indice de rareté.
3. Faire défiler les cartes par swipe plutôt que par bouton.
4. Pouvoir revoir une carte du bilan en grand.
5. Pouvoir rester sur une belle carte aussi longtemps que souhaité.
6. Un geste raté ne doit pas faire avancer la séquence.
7. Les gestes doivent être indiqués visuellement.
8. Il faut un moyen de contourner un geste qui fonctionne mal sur un appareil donné.

## Panel experts — proposition

### Déchirure

- zone de déchirure explicite sur le haut du paquet ;
- progression continue suivant le doigt ;
- swipe accepté dans les deux sens ;
- seuil volontairement tolérant ;
- feedback haptique à la validation ;
- alternative « Ouvrir sans geste ».

### Tranche des cartes

Après déchirure, les cinq cartes sortent face cachée et légèrement décalées.

Chaque tranche possède un signal visuel discret :
- Commune : neutre ;
- Inhabituelle : légère teinte ;
- Rare : reflet visible ;
- Épique : reflet plus intense ;
- Légendaire : liseré chaud ;
- Mythique : reflet irisé.

Le nom et la rareté restent cachés. Le joueur obtient seulement le plaisir de repérer qu'une carte plus brillante pourrait se trouver au fond du paquet.

La pile peut être légèrement écartée au doigt avant la révélation afin de mieux lire les cinq tranches.

### Révélation

- toucher la pile retourne la première carte ;
- chaque carte suivante se révèle en faisant glisser la précédente à gauche ou à droite ;
- le mouvement suit le doigt en temps réel ;
- un swipe trop court revient en place ;
- un flick rapide est reconnu même si sa distance est plus courte ;
- aucune temporisation automatique : le joueur peut admirer la carte ;
- « Tout révéler » reste disponible pour les ouvertures répétées.

### Bilan interactif

- les cinq mini-cartes du bilan deviennent des boutons ;
- toucher une carte la réouvre en grand ;
- navigation précédente/suivante depuis l'inspection ;
- possibilité de déplacer le doigt sur la carte agrandie pour incliner son reflet ;
- retour immédiat au bilan.

## Panel utilisateurs — tour 2

Points validés :
- la tranche donne une anticipation supplémentaire sans révéler directement la carte ;
- accepter les swipes gauche et droite évite une contrainte arbitraire ;
- la carte doit suivre physiquement le doigt ;
- le retour élastique d'un swipe insuffisant est plus compréhensible qu'un geste ignoré ;
- le bilan interactif donne une vraie utilité au résumé final ;
- l'inspection plein écran est particulièrement pertinente pour Rare+.

Friction détectée : rendre la déchirure ou le swipe obligatoires serait une régression d'accessibilité. Les actions de secours restent donc visibles mais secondaires.

## Panel experts — décisions finales

Retenu :
- Pointer Events, compatibles tactile/souris/stylet ;
- `touch-action: none` uniquement sur les surfaces manipulées ;
- seuils centralisés dans `v170.js` et testés ;
- haptique légère, plus forte sur les rares ;
- mouvements basés sur `transform` et `opacity` ;
- mode `prefers-reduced-motion` conservé ;
- aucune nouvelle image bitmap ;
- aucune dépendance réseau ;
- aucune modification de l'économie V1.6.

Non retenu pour cette version :
- sons de déchirure synthétiques : utile, mais nécessite un vrai réglage audio global plutôt qu'un son impossible à couper ;
- révélation automatique temporisée : enlève le contrôle au joueur ;
- afficher le nom de la rareté sur la tranche : trop révélateur ;
- gestes secrets sans indication : mauvaise découvrabilité ;
- swipe dans une seule direction : contrainte inutile.

## Critères d'acceptation

- [x] Le booster peut être déchiré au doigt.
- [x] La progression de déchirure suit le doigt.
- [x] Déchirure gauche/droite.
- [x] Alternative sans geste.
- [x] Les cinq tranches sont visibles avant la révélation.
- [x] Les tranches Rare+ sont visuellement détectables sans afficher leur identité.
- [x] La pile peut être légèrement éventailée au doigt.
- [x] Les cartes avancent par swipe gauche ou droite.
- [x] Un swipe insuffisant revient en place.
- [x] Les flicks courts et rapides sont reconnus.
- [x] Le joueur peut rester sur une carte sans limite de temps.
- [x] « Tout révéler » reste disponible.
- [x] Les cartes du bilan sont interactives.
- [x] Une carte peut être revue en grand.
- [x] Navigation entre les cartes en inspection.
- [x] Reflet inclinable au doigt en inspection.
- [x] Clavier et alternatives accessibles conservés.
- [x] Mode mouvement réduit conservé.
- [x] Seuils gestuels couverts par tests unitaires.
