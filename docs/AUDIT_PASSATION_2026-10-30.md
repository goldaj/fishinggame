# Audit contradictoire exhaustif : Fishinggame / Pêche & Merveilles

Date : **2026-10-30**. Inventaire direct GitHub : **98 branches** (69 SHAs distincts), **34 PR** (32 fusionnées), README, AGENTS, racine. Comparaisons de chaque SHA distinct au commit de `main` effectuées ; les refs partageant un SHA ont le même statut. Aucun APK construit ni test de gameplay exécuté pendant cette revue.

## Référence et danger de fusion
- `main` à l'ouverture : `0d233edf3f186611c90b910ca151280c44b71966`.
- **20 branches divergentes** ; elles ont au moins un commit historique absent de main. Cela ne prouve PAS que la fonctionnalité manque : plusieurs PR sont marquées fusionnées et le code a continué d'évoluer.
- **77 branches absorbées** : 0 commit exclusif. Ne pas les retirer sans vérifier les éventuels consommateurs (CI, releases, liens externes).

## Branches : audit ref par ref
| Branche | SHA | Git vs main | Décision de l'audit |
| --- | --- | --- | --- |
| `chatgpt/get-a-point-20260902` | `87739566de74` | diverged (commits propres) | préserver et comparer sémantiquement |
| `chatgpt/review-20261024` | `dc5efa408ffd` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `ci/apk-validation` | `7f205ffa348b` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feat/fishing-cards-v180` | `c4c08349dd61` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feat/fishing-experience-v190` | `c8f7cf340bf6` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feat/sell-card-duplicates-v201` | `91e1e1f3709f` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feat/unified-cards-v200` | `3a1f901fd8dd` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feature/better-reveal-animations-v1-4-2` | `90448fe7c93a` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/booster-experience-1.6.0` | `6b32b38be05b` | diverged (commits propres) | préserver et comparer sémantiquement |
| `feature/catalog-500-cards-gacha-v1-4-0` | `3ba07a1e5de1` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/combo-timing-v1-2` | `8b601514ccb0` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/generated-card-art` | `9b41fe73b71d` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/generated-card-art-temp-check` | `a3d93e2e2969` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/generated-card-art-temp-check-2` | `a3d93e2e2969` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/generated-card-art-temp-check-3` | `a3d93e2e2969` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/nav-layout-gacha-lock-v1-4-3` | `c7f80fbc0b8b` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/patience-fishing-v1-1` | `d5c8e7f33161` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/pro-card-boosters-v1-5-0` | `d8590c95575c` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/pro-tcg-boosters-v1-5-0` | `12114fff26fc` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/rank-wild-discovery-v1-3-2` | `d61edf9370ba` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/stronger-upgrades-unique-assets-v1-3-0` | `bbb817bc4eb3` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `feature/tactile-booster-experience-1.7.0` | `3a28a0828e6e` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/android-safe-area` | `04539a516fdf` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/booster-opening-ux-2.0.5` | `39ec9864de06` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/card-pack-cost-v1-4-1` | `406c80d00fd8` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `fix/haptics-streak-v1-2-2` | `6445acc7748d` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `fix/market-shop-unified-v1-2-1` | `8730714320ac` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `fix/v170-disable-legacy-booster-ui` | `ea0b56284ee3` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/v170-tap-and-tear-target` | `3df4f6ef0d4d` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/v172-tear-band` | `566bc8b14d1a` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/v173-fluid-tear` | `bad2786bcdbe` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/v174-restore-real-tactile-booster` | `9b392fdf6a3a` | diverged (commits propres) | préserver et comparer sémantiquement |
| `fix/v175-tear-from-fold-edges` | `5cd212ebbfe5` | diverged (commits propres) | préserver et comparer sémantiquement |
| `game-initial` | `99285f2c581e` | diverged (commits propres) | préserver et comparer sémantiquement |
| `hotfix/booster-2.0.3` | `de84a00de12c` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `hotfix/booster-2.0.4` | `9c916d056935` | diverged (commits propres) | préserver et comparer sémantiquement |
| `main` | `0d233edf3f18` | référence | conserver |
| `noop` | `26f20dd68167` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `tmp-card-art-071-080-transport-check` | `bc53d605fe6d` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-assets` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-binary` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-deletequeue` | `f81b08ce6dcb` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-deletequeue2` | `f81b08ce6dcb` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-final` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-finalstage` | `f81b08ce6dcb` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-finalstage2` | `f81b08ce6dcb` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-integrate` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-pack` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-ready` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-ready2` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-ready3` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-ready4` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-staged` | `3e38cc95a74e` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100-v2` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-091-100` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-a` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-binary` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-complete` | `26cc29563f86` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-final2` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-finalize` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-real` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-stage` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-101-110-work` | `753ceea1ce44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-111-120-complete` | `7607a812c1cd` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-121-130-complete` | `81b380823e6c` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-131-140-complete` | `e00f129271e3` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-141-150-complete` | `26f20dd68167` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-151-160-exact` | `f543a7ae6a04` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-161-170-complete` | `eb59b7777f6e` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-171-180-complete` | `47d4d1e21dbd` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-181-190-complete` | `4c913c876f3b` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-191-200-complete` | `49b8535c6781` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-201-210` | `b16fcda1bfc8` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-211-220` | `75ebb8cc0ed4` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-221-240` | `b564a367c715` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-241-260` | `6b93a9bf7795` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-261-270` | `698eb8528572` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-261-280` | `6b93a9bf7795` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-271-280` | `1e4bf2964d44` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-281-300` | `caa7c7e95a1b` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-301-320` | `c3f9bed2e264` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-321-340` | `11aac6da7171` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-341-360` | `a7b2e7c3d1d6` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-361-380` | `706ded94a50a` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-381-420` | `ed9b3bba687c` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/card-art-421-504` | `7fa04a32f90e` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/last-route-check` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/route-bug-final` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/route-check-blob` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/route-forced-by-schema` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/test-blob-route` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v208-fishing-balance` | `caa02892c748` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v209-trash-cleanup` | `4ea1fc87e312` | diverged (commits propres) | préserver et comparer sémantiquement |
| `work/v209-trash-cleanup-clean` | `86be1722cdff` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v210-card-collection` | `9a348e1a31f8` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v211-hide-pity-and-spoilers` | `5b7ceeaa5424` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v211-version-code35` | `df6bea26d96f` | behind (0 commit propre) | candidate nettoyage après contrôle |
| `work/v211-version-patch` | `d54711bab2e6` | diverged (commits propres) | préserver et comparer sémantiquement |

## PR historiques
- [#34](https://github.com/goldaj/fishinggame/pull/34) : closed, fusionnée — [ChatGPT] Fishinggame : récupération des sauvegardes et démarrage robuste
- [#33](https://github.com/goldaj/fishinggame/pull/33) : closed, fusionnée — 2.0.11 packaging hotfix
- [#32](https://github.com/goldaj/fishinggame/pull/32) : closed, fusionnée — 2.0.10 hotfix — hide pity copy and unknown card art
- [#31](https://github.com/goldaj/fishinggame/pull/31) : closed, fusionnée — v2.0.10 — collection, discovery pity and card purchases
- [#30](https://github.com/goldaj/fishinggame/pull/30) : closed, fusionnée — fix: refine booster opening UX without touching tactile engine
- [#29](https://github.com/goldaj/fishinggame/pull/29) : closed, fusionnée — hotfix: restore exact 2.0.1 tactile booster in 2.0.4
- [#28](https://github.com/goldaj/fishinggame/pull/28) : closed, fusionnée — hotfix: restore booster opening interactions in 2.0.3
- [#27](https://github.com/goldaj/fishinggame/pull/27) : closed, fusionnée — release: Fishing Cards 2.0.2
- [#26](https://github.com/goldaj/fishinggame/pull/26) : closed, fusionnée — feat: sell duplicate cards in market
- [#25](https://github.com/goldaj/fishinggame/pull/25) : closed, fusionnée — feat: unify fishing and booster cards in 2.0.0
- [#24](https://github.com/goldaj/fishinggame/pull/24) : closed, fusionnée — feat: overhaul the Fishing Cards fishing experience in 1.9.0
- [#23](https://github.com/goldaj/fishinggame/pull/23) : closed, fusionnée — feat: turn fishing catches into Fishing Cards in 1.8.0
- [#22](https://github.com/goldaj/fishinggame/pull/22) : closed, fusionnée — fix: tear boosters from fold edges in 1.7.5
- [#21](https://github.com/goldaj/fishinggame/pull/21) : closed, fusionnée — fix: restore real tactile booster flow in 1.7.4
- [#20](https://github.com/goldaj/fishinggame/pull/20) : closed, fusionnée — fix: make booster tearing fluid under the thumb in 1.7.3
- [#19](https://github.com/goldaj/fishinggame/pull/19) : closed, fusionnée — fix: widen tear band around booster seam in 1.7.2
- [#18](https://github.com/goldaj/fishinggame/pull/18) : closed, fusionnée — fix: tap cards and tear from the packet edge in 1.7.1
- [#17](https://github.com/goldaj/fishinggame/pull/17) : closed, fusionnée — fix: isolate legacy booster UI under 1.7.0
- [#16](https://github.com/goldaj/fishinggame/pull/16) : closed, fusionnée — feat: tactile booster experience 1.7.0
- [#15](https://github.com/goldaj/fishinggame/pull/15) : closed, fusionnée — feat: premium booster experience 1.6.0
- [#14](https://github.com/goldaj/fishinggame/pull/14) : closed, fusionnée — Pêche & Merveilles 1.5.0 — boosters TCG professionnalisés
- [#13](https://github.com/goldaj/fishinggame/pull/13) : closed, fusionnée — Pêche & Merveilles 1.4.3 — navigation centrée et Gacha masqué avant rang 8
- [#12](https://github.com/goldaj/fishinggame/pull/12) : closed, fusionnée — Pêche & Merveilles 1.4.2 — reveals animés pour pêche, cartes et gacha
- [#11](https://github.com/goldaj/fishinggame/pull/11) : closed, fusionnée — Pêche & Merveilles 1.4.1 — packs à 500 ◉ et signalement des nouveautés
- [#10](https://github.com/goldaj/fishinggame/pull/10) : closed, fusionnée — Pêche & Merveilles 1.4.0 — 500 espèces, gacha rang 8+ et packs de cartes
- [#9](https://github.com/goldaj/fishinggame/pull/9) : closed, fusionnée — Pêche & Merveilles 1.3.2 — découvertes sauvages par rang
- [#8](https://github.com/goldaj/fishinggame/pull/8) : closed, fusionnée — Pêche & Merveilles 1.3.1 — améliorations renforcées, 100 prises uniques et déchets
- [#7](https://github.com/goldaj/fishinggame/pull/7) : closed, fusionnée — Pêche & Merveilles 1.2.2 — haptique restauré et séries strictes
- [#6](https://github.com/goldaj/fishinggame/pull/6) : closed, fusionnée — Pêche & Merveilles 1.2.1 — marché et améliorations réunis
- [#5](https://github.com/goldaj/fishinggame/pull/5) : closed, fusionnée — Pêche & Merveilles 1.2 — combos, poids, boutique et haptique
- [#4](https://github.com/goldaj/fishinggame/pull/4) : closed, fusionnée — Pêche & Merveilles 1.1 — patience, timing et release signée
- [#3](https://github.com/goldaj/fishinggame/pull/3) : closed, fusionnée — Fix Android navigation bar overlap
- [#2](https://github.com/goldaj/fishinggame/pull/2) : closed, clôturée sans fusion — Validate Android APK build
- [#1](https://github.com/goldaj/fishinggame/pull/1) : closed, clôturée sans fusion — Add initial playable fishing game

## Sources du projet
Racine : `.github`, `.gitignore`, `AGENTS.md`, `BOOSTER_EXPERIENCE_1.6.0.md`, `BOOSTER_EXPERIENCE_1.7.0.md`, `QA_PANEL.md`, `README.md`, `SIGNING.md`, `app`, `build.gradle`, `docs`, `gradle.properties`, `settings.gradle`, `tests`.

README (extrait) : # Pêche & Merveilles

Jeu mobile Android hors-ligne de pêche, de patience et de collection.

Boucle principale : **observer et pêcher → vendre → économiser → utiliser le gacha → débloquer une nouvelle créature → compléter la collection**.

## Fonctionnalités de base — itération 1.1

- 100 créatures configurées.
- 6 niveaux de rareté : Commune, Inhabituelle, Rare, Épique, Légendaire et Mythique.
- **1 seule espèce commune** débloquée au démarrage.
- Les espèces gagnées au gacha deviennent immédiatement pêchables.
- Le gacha ne donne pas de doublon tant qu'une nouvelle créature accessible reste à débloquer.
- 10 rangs de progression avec un rythme volontairement lent ; certaines créatures restent absentes du gacha tant que le rang requis n'est pas atteint.
- Pêche active anti-spam : relever la ligne sans poisson, rater en ferrant trop tôt ou trop tard, réussir uniquement dans la bonne fenêtre.
- Fenêtres de ferrage variables et de plus en plus courtes avec la rareté.
- Marché pour vendre les prises contre la monnaie du jeu.
- Collection de cartes avec présentation différente selon la rareté et indication du rang requis.
- Sauvegarde locale sur l'appareil.
- Interface mobile retravaillée et prise en compte des `WindowInsets` Android pour les barres système.

## Build Android

Pile :

- Android Gradle Plugin 8.9.2
- Gradle 8.11.1
- JDK 17
- compileSdk / targetSdk 35
- Android Build

AGENTS (extrait) : # AGENTS.md — Pêche & Merveilles (Fishinggame)

## Avant de travailler
1. Lire `README.md` et les documents techniques pertinents, puis **`docs/CHATGPT_PROJECT_HISTORY.md`** pour les demandes, décisions et lacunes du contexte.
2. Jeu de pêche Android hors-ligne avec captures actives, vente, économie, gacha, collection et progression par rang, code Java/HTML/JS en WebView.
3. Respecter le déroulé de progression et la sauvegarde locale, ne pas introduire d'économie payante sans décision explicite. Ne jamais versionner les clés de signature. Préserver toutes les branches/versions déjà travaillées.

## Exécution et vérification
- `node tests/core.test.js` pour la logique ; build release Android JDK 17, SDK 35, Gradle 8.11.1, APK non signé ; vérifier CI et ne pas prétendre avoir produit un APK signé.
- Utiliser de petites modifications contrôlables. Ne pas écraser ni supprimer des fichiers ou anciennes versions sans demande explicite.
- Distinguer hypothèses, code présent, essais effectivem

## Challenge fonctionnel pour l'agent suivant
1. **Ne pas rejouer toutes les branches divergentes** : comparer d'abord le code courant et les patches historiques (versions v1.x → v2.0.11), notamment les animations tactiles, boosts, navigation Android, cartes et tests de régression. Les divergences peuvent représenter une implémentation remplacée après squash/merge.
2. Différencier bugs de production et prototypes abandonnés : `ci/apk-validation` et `game-initial` contiennent une histoire propre très ancienne ; `work/v211-version-patch` est un workflow temporaire de bump de version, pas une fonctionnalité à réintroduire.
3. Faire des tests de sauvegarde/chargement et migration, taux de prise, équilibrage économique des boosters, achats et collection, suppression de doublons, progression sans soft-lock.
4. Rebuilder un APK signé de test, vérifier sur Android réel, rotation/zone de sécurité, performances tactiles, robustesse après perte de réseau.
5. Contrôler les runs Actions, ne pas déduire que 32 PR fusionnées signifient 32 fonctionnalités actuellement correctes. Ne pas modifier `main` pour une simple opération de graphe Git.
6. Faire porter tout changement futur dans une PR ciblée avec preuve de tests et note de compatibilité. Aucune suppression de branche, aucun merge ou changement de gameplay réalisé par **cet audit documentaire**.


## Vérification CI distante (30 octobre 2026)
- [Android Release Candidate](https://github.com/goldaj/fishinggame/actions/runs/41046494534) : **success** sur commit documentaire `63c75469a7a2`.

Ce résultat décrit uniquement le workflow cité, pas un test utilisateur, un playtest complet ni une validation de la production. Le prochain agent doit lire les jobs, confirmer la couverture des scénarios demandés et relancer après ses modifications.
