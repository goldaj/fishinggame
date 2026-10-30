# Audit exhaustif des 98 branches — Pêche & Merveilles — 30 octobre 2026

## Objet et garde-fous
Jeu Android hors ligne, progression pêche/collection/gacha. Cette passe examine les refs Git et PR et confronte les décisions précédentes : **aucun test d'APK, gameplay ou sauvegarde exécuté ici**. Conserver toutes versions historiques, signatures hors Git et sauvegardes personnelles ; ne pas transformer « déjà mergé » en « expérience joueur validée ». Branche de référence `main` au SHA `9d0312cc89cc8e3e02598e0d4d62809974e33156` (au relevé).

## Résumé du nettoyage
- 98 branches actuelles dont `main` ; 20 branches montrent des commits divergents du SHA principal (revérification ciblée GitHub), 77 anciennes références ont été relevées comme ancêtres au cours des contrôles d'ascendance du 30/10. Les comparaisons anciennes sont monotones tant que la base n'est pas réécrite ; revérifier les SHA juste avant suppression.
- 34 PR historiques, 32 fusionnées, 2 fermées sans fusion directe, aucune ouverte. Certaines branches restent divergentes même si leur PR a été fusionnée par **squash** : ce n'est pas la preuve qu'une fonctionnalité manque, mais le graphe Git ne suffit pas pour supprimer aveuglément.
- Les nombreuses refs `work/card-art-091-100-*` pointent souvent sur le **même commit** ; les préserver comme références historiques jusqu'à contrôle des scripts/liens, puis les regrouper pour nettoyage. Ne pas propager des images binaires privées/non licenciées.

## Inventaire branche par branche
| Branche | SHA court | Statut / décision |
|---|---|---|
| `main` | `9d0312cc89cc` | Référence de production, **conserver** |
| `chatgpt/get-a-point-20260902` | `87739566de74` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `chatgpt/review-20261024` | `dc5efa408ffd` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `ci/apk-validation` | `7f205ffa348b` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feat/fishing-cards-v180` | `c4c08349dd61` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feat/fishing-experience-v190` | `c8f7cf340bf6` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feat/sell-card-duplicates-v201` | `91e1e1f3709f` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feat/unified-cards-v200` | `3a1f901fd8dd` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feature/better-reveal-animations-v1-4-2` | `90448fe7c93a` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/booster-experience-1.6.0` | `6b32b38be05b` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `feature/catalog-500-cards-gacha-v1-4-0` | `3ba07a1e5de1` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/combo-timing-v1-2` | `8b601514ccb0` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/generated-card-art` | `9b41fe73b71d` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/generated-card-art-temp-check` | `a3d93e2e2969` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/generated-card-art-temp-check-2` | `a3d93e2e2969` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/generated-card-art-temp-check-3` | `a3d93e2e2969` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/nav-layout-gacha-lock-v1-4-3` | `c7f80fbc0b8b` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/patience-fishing-v1-1` | `d5c8e7f33161` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/pro-card-boosters-v1-5-0` | `d8590c95575c` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/pro-tcg-boosters-v1-5-0` | `12114fff26fc` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/rank-wild-discovery-v1-3-2` | `d61edf9370ba` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/stronger-upgrades-unique-assets-v1-3-0` | `bbb817bc4eb3` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `feature/tactile-booster-experience-1.7.0` | `3a28a0828e6e` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/android-safe-area` | `04539a516fdf` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/booster-opening-ux-2.0.5` | `39ec9864de06` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/card-pack-cost-v1-4-1` | `406c80d00fd8` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `fix/haptics-streak-v1-2-2` | `6445acc7748d` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `fix/market-shop-unified-v1-2-1` | `8730714320ac` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `fix/v170-disable-legacy-booster-ui` | `ea0b56284ee3` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/v170-tap-and-tear-target` | `3df4f6ef0d4d` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/v172-tear-band` | `566bc8b14d1a` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/v173-fluid-tear` | `bad2786bcdbe` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/v174-restore-real-tactile-booster` | `9b392fdf6a3a` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `fix/v175-tear-from-fold-edges` | `5cd212ebbfe5` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `game-initial` | `99285f2c581e` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `hotfix/booster-2.0.3` | `de84a00de12c` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `hotfix/booster-2.0.4` | `9c916d056935` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `noop` | `26f20dd68167` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `tmp-card-art-071-080-transport-check` | `bc53d605fe6d` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-assets` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-binary` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-deletequeue` | `f81b08ce6dcb` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-deletequeue2` | `f81b08ce6dcb` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-final` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-finalstage` | `f81b08ce6dcb` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-finalstage2` | `f81b08ce6dcb` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-integrate` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-pack` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-ready` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-ready2` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-ready3` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-ready4` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-staged` | `3e38cc95a74e` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100-v2` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-091-100` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-a` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-binary` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-complete` | `26cc29563f86` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-final2` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-finalize` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-real` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-stage` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-101-110-work` | `753ceea1ce44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-111-120-complete` | `7607a812c1cd` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-121-130-complete` | `81b380823e6c` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-131-140-complete` | `e00f129271e3` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-141-150-complete` | `26f20dd68167` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-151-160-exact` | `f543a7ae6a04` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-161-170-complete` | `eb59b7777f6e` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-171-180-complete` | `47d4d1e21dbd` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-181-190-complete` | `4c913c876f3b` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-191-200-complete` | `49b8535c6781` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-201-210` | `b16fcda1bfc8` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-211-220` | `75ebb8cc0ed4` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-221-240` | `b564a367c715` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-241-260` | `6b93a9bf7795` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-261-270` | `698eb8528572` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-261-280` | `6b93a9bf7795` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-271-280` | `1e4bf2964d44` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-281-300` | `caa7c7e95a1b` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-301-320` | `c3f9bed2e264` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-321-340` | `11aac6da7171` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-341-360` | `a7b2e7c3d1d6` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-361-380` | `706ded94a50a` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-381-420` | `ed9b3bba687c` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/card-art-421-504` | `7fa04a32f90e` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/last-route-check` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/route-bug-final` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/route-check-blob` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/route-forced-by-schema` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/test-blob-route` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v208-fishing-balance` | `caa02892c748` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v209-trash-cleanup` | `4ea1fc87e312` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |
| `work/v209-trash-cleanup-clean` | `86be1722cdff` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v210-card-collection` | `9a348e1a31f8` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v211-hide-pity-and-spoilers` | `5b7ceeaa5424` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v211-version-code35` | `df6bea26d96f` | **Ancêtre** de main d'après contrôle Git précédent ; candidate à nettoyage sous réserve de liens externes |
| `work/v211-version-patch` | `d54711bab2e6` | **Divergente** : commits propres ; comparer patch/diff et intention de PR avant toute fusion ou suppression |

## PR à examiner
- [#2](https://github.com/goldaj/fishinggame/pull/2) : fermée sans merge ; `ci/apk-validation` → `main`. Ne pas rouvrir automatiquement ; vérifier si les travaux subsistent seulement comme provenance.
- [#1](https://github.com/goldaj/fishinggame/pull/1) : fermée sans merge ; `game-initial` → `main`. Ne pas rouvrir automatiquement ; vérifier si les travaux subsistent seulement comme provenance.
Toutes les autres PR #3 à #34 sont déclarées fusionnées par GitHub. **Une PR GitHub historique ne se supprime pas** ; seules les branches résiduelles sont nettoyables.

## Points faibles à challenger
1. **Économie** : équilibrage pêche/rang/rareté/taux gacha/duplicates, récompenses non dominantes, coût des boosters, comportements anti-spam ; générer des trajectoires multi-seeds avec objectifs de joueur réalistes, puis test humain.
2. **UX booster** : historiquement de nombreux correctifs tactiles v1.7–v2.0, divergences de branches malgré merges. Mesurer gestes sur vrais téléphones (densités, doigt au bord, événements multiples), vérifier que le booster s'ouvre et se ferme sans perte d'état.
3. **Sauvegarde** : garantir migration de version, collection, argent, cartes et tirages ; tests de redémarrage/backup ; aucun écrasement de sauvegarde personnelle.
4. **Build** : vérifier Gradle/JDK 17, compileSdk 35, tests Node du cœur, APK non signé et artefacts CI sans déclarer une version distribuée.
5. **Archives/dépôts voisins** : `chatgpt/get-a-point-20260902` concerne un projet désormais autonome ; la PR `ci/apk-validation` n'ajoute qu'un document temporaire. Ne pas merger ces branches dans le produit par réflexe. `work/v211-version-patch` porte un ancien workflow de modification de versions automatisée, à examiner comme **risque de modification de release**, pas comme fonctionnalité manquante.

## Reprise pour Codex
Relire `README.md`, `AGENTS.md`, `docs/CHATGPT_PROJECT_HISTORY.md`, l'historique des versions et les docs du moteur de boosters. **Avant nettoyage**, consulter toutes les URL PR, les SHA et consommateurs de refs (Actions, releases, scripts). Exécuter les tests réellement et valider sauvegardes/UX sur appareil. Garder `main` stable ; aucune fusion, renommage ou suppression n'a été entreprise pendant cette passe documentaire.
