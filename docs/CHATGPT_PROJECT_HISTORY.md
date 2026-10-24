# Contexte ChatGPT pour Pêche & Merveilles (Fishinggame)

**Initialisé le 2026-10-24. Couverture : partielle, sauf les sources originales référencées explicitement.** Codex doit lire ce fichier après `AGENTS.md` et avant toute reprise du projet. Une mémoire reconstruite n'est pas la totalité du chat.

## Projet confirmé par le dépôt
- Dépôt : `goldaj/fishinggame`.
- Objet : Jeu de pêche Android hors-ligne avec captures actives, vente, économie, gacha, collection et progression par rang, code Java/HTML/JS en WebView.
- Contraintes : Respecter le déroulé de progression et la sauvegarde locale, ne pas introduire d'économie payante sans décision explicite. Ne jamais versionner les clés de signature. Préserver toutes les branches/versions déjà travaillées.
- Validation : `node tests/core.test.js` pour la logique ; build release Android JDK 17, SDK 35, Gradle 8.11.1, APK non signé ; vérifier CI et ne pas prétendre avoir produit un APK signé.

## Échanges attestés ou sources à lire

2026-08-24 19:47:45 UTC — Utilisateur, résumé reconstruit (non verbatim) : travailler dans `goldaj/fishinggame` et conserver le contexte.

2026-08-30 19:30:12 UTC — Utilisateur, résumé reconstruit (non verbatim) : lot 081–090 achevé, prochain 091–100 ; expliquer brièvement avant d'agir et conserver le contexte de reprise.

2026-10-18 — Assistant, résumé reconstruit (non verbatim) : inventaire GitHub et maintien de Fishinggame comme dépôt distinct. Les transcriptions antérieures de centaines d'itérations ne sont pas entièrement accessibles ici.

2026-10-24 — Utilisateur (verbatim, heure non vérifiable) : « je te demande de lire mes repo git où tu es le dernier utilisateur, de rajouter un AGENTS.md pertinent s'il n'y en a pas. Mais en plus, tu rajoutera un document repérable par codex (peut être le référencer dans le AGENTS.md justement ?) où tu mets l'intégralité de nos échanges liés à ce projet. Mes questions, tes réponses (de sorte à les différencier) et les horodatages si tu les as. »

## Limites de couverture, fidélité et mise à jour
- Les passages marqués `verbatim` sont des extraits exacts disponibles dans le contexte ; les résumés ne doivent **jamais** être cités comme du dialogue mot pour mot. Aucune réponse complète de l'assistant n'a été inventée.
- Pour obtenir l'intégralité des questions, réponses et horodatages : intégrer un export authentique des conversations pertinentes ; conserver l'ordre et le rôle des messages, et expurger avant publication les éléments sensibles et hors projet.
- En intervention future, ajouter en bas les nouveaux dialogues sourcés et les décisions vérifiées, sans effacer les entrées précédentes. Ce journal et `AGENTS.md` sont versionnés dans Git.

## 2026-10-24 — Revue parallèle multi-dépôts (heure non disponible)

**Utilisateur (verbatim, message visible dans cette conversation)** :

> tu vois tout le boulot qu'on a fait sur la conversation Avancement projets codex ?
> Tu vas refaire la même chose sur TOUT mon repo git. Tu vas commencer par les projets les plus gros, regarder ce que tu peux faire dessus et le faire sur ta branch (même consignes que sur l'autre conversation).
> Tu vas ensuite me faire un rapport très succint des projets que t'as touché et de ce que t'as avancé dessus.
> Amuse toi !

**Assistant (résumé reconstruit, non verbatim)** : revue des gros dépôts et amélioration isolée sur `chatgpt/review-20261024`. Normalisation des sauvegardes WebView héritées (identifiants numériques, soldes et compteurs mal formés) ; test dédié ajouté à la CI.

**Validation et confiance** : confiance élevée sur la portée du changement ; aucune exécution locale des tests ne peut être attestée depuis l'accès GitHub disponible. Consulter les statuts GitHub Actions de la PR avant intégration. Aucune modification de `main`/`develop`, aucun déploiement. Codex doit inspecter le diff, relancer les tests et choisir les commits à intégrer sans écraser son travail.
